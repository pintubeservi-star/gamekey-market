package com.artex.clipper

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.provider.OpenableColumns
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.util.concurrent.TimeUnit

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent { Screen() }
    }
}

private val http = OkHttpClient.Builder()
    .connectTimeout(30, TimeUnit.SECONDS)
    .readTimeout(30, TimeUnit.MINUTES)
    .writeTimeout(30, TimeUnit.MINUTES)
    .build()

@Composable
fun Screen() {
    val bg = Color(0xFF090B10)
    val cyan = Color(0xFF35D7E8)
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    var selected by remember { mutableStateOf<Uri?>(null) }
    var rights by remember { mutableStateOf(false) }
    var seconds by remember { mutableFloatStateOf(60f) }
    var api by remember { mutableStateOf("https://artex-clipper-api-production.up.railway.app") }
    var status by remember { mutableStateOf("Configura la URL HTTPS de tu motor de procesamiento.") }
    var busy by remember { mutableStateOf(false) }
    var outputs by remember { mutableStateOf(listOf<String>()) }
    val picker = rememberLauncherForActivityResult(ActivityResultContracts.OpenDocument()) { selected = it }

    MaterialTheme(colorScheme = darkColorScheme(primary = cyan, background = bg, surface = Color(0xFF151A24))) {
        Column(
            Modifier.fillMaxSize().background(bg).verticalScroll(rememberScrollState()).padding(22.dp),
            verticalArrangement = Arrangement.spacedBy(18.dp)
        ) {
            Text("ARTEX CLIPPER", color = Color.White, fontSize = 23.sp, style = MaterialTheme.typography.headlineSmall)
            Text("AI VIDEO STUDIO", color = cyan, letterSpacing = 4.sp, fontSize = 11.sp)
            Text("Convierte videos largos en clips verticales.", color = Color.White, fontSize = 28.sp)
            OutlinedTextField(
                value = api, onValueChange = { api = it.trim() }, modifier = Modifier.fillMaxWidth(),
                label = { Text("URL HTTPS del motor (Railway)") },
                placeholder = { Text("https://tu-api.up.railway.app") },
                singleLine = true
            )
            Card(colors = CardDefaults.cardColors(containerColor = Color(0xFF151A24)), shape = RoundedCornerShape(20.dp)) {
                Column(Modifier.fillMaxWidth().padding(18.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
                    Text(selected?.lastPathSegment ?: "Selecciona un video", color = Color.White)
                    Button(onClick = { picker.launch(arrayOf("video/*")) }, modifier = Modifier.fillMaxWidth()) { Text("Elegir video") }
                    Text("Duración máxima: ${seconds.toInt()} segundos", color = Color.White)
                    Slider(value = seconds, onValueChange = { seconds = it }, valueRange = 15f..240f)
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Checkbox(checked = rights, onCheckedChange = { rights = it })
                        Text("Tengo derechos o autorización para usar este video.", color = Color.LightGray, fontSize = 12.sp)
                    }
                    Button(
                        onClick = {
                            val uri = selected ?: return@Button
                            scope.launch {
                                busy = true; status = "Subiendo video…"; outputs = emptyList()
                                try {
                                    val result = withContext(Dispatchers.IO) {
                                        val base = api.trimEnd('/')
                                        require(base.startsWith("https://")) { "La API debe usar HTTPS." }
                                        val fileBytes = context.contentResolver.openInputStream(uri)?.use { it.readBytes() }
                                            ?: error("No se pudo leer el video.")
                                        val mime = context.contentResolver.getType(uri) ?: "video/mp4"
                                        val name = context.contentResolver.query(uri, null, null, null, null)?.use { c ->
                                            val ix = c.getColumnIndex(OpenableColumns.DISPLAY_NAME)
                                            if (c.moveToFirst() && ix >= 0) c.getString(ix) else "video.mp4"
                                        } ?: "video.mp4"
                                        val body = MultipartBody.Builder().setType(MultipartBody.FORM)
                                            .addFormDataPart("max_clip_seconds", seconds.toInt().toString())
                                            .addFormDataPart("file", name, fileBytes.toRequestBody(mime.toMediaTypeOrNull()))
                                            .build()
                                        val req = Request.Builder().url("$base/api/jobs")
                                            .header("X-Content-Rights", "confirmed").post(body).build()
                                        val created = http.newCall(req).execute().use { r ->
                                            if (!r.isSuccessful) error(r.body?.string() ?: "Error al subir el video")
                                            JSONObject(r.body!!.string())
                                        }
                                        val id = created.getString("id")
                                        var state = created
                                        while (state.optString("status") == "queued" || state.optString("status") == "processing") {
                                            kotlinx.coroutines.delay(2500)
                                            val poll = Request.Builder().url("$base/api/jobs/$id").get().build()
                                            state = http.newCall(poll).execute().use { r ->
                                                if (!r.isSuccessful) error("No se pudo consultar el procesamiento.")
                                                JSONObject(r.body!!.string())
                                            }
                                        }
                                        if (state.optString("status") != "completed") error(state.optString("error", "El procesamiento falló."))
                                        val list = state.getJSONArray("clips")
                                        (0 until list.length()).map { "$base" + list.getJSONObject(it).getString("url") }
                                    }
                                    outputs = result
                                    status = "¡Listo! Se crearon ${result.size} clips."
                                } catch (e: Exception) {
                                    status = e.message ?: "Error al procesar el video."
                                } finally { busy = false }
                            }
                        },
                        enabled = selected != null && rights && !busy && api.startsWith("https://"),
                        modifier = Modifier.fillMaxWidth()
                    ) { Text(if (busy) "Procesando…" else "Analizar y crear clips") }
                }
            }
            Text(status, color = cyan, fontSize = 13.sp)
            outputs.forEachIndexed { index, url ->
                OutlinedButton(onClick = {
                    context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url)))
                }, modifier = Modifier.fillMaxWidth()) { Text("Descargar clip ${index + 1}") }
            }
            Text("Usa solamente videos propios o con autorización. El análisis visual de escenas no predice viralidad.", color = Color.Gray, fontSize = 12.sp)
        }
    }
}
