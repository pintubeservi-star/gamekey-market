package com.artex.clipper

import android.app.DownloadManager
import android.content.Context
import android.net.Uri
import android.os.Bundle
import android.os.Environment
import android.provider.OpenableColumns
import android.widget.VideoView
import android.widget.MediaController
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody
import okio.BufferedSink
import org.json.JSONObject
import java.util.concurrent.TimeUnit

private const val API_BASE = "https://artex-clipper-api-production.up.railway.app"

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent { ArtexStudio() }
    }
}

private val http = OkHttpClient.Builder()
    .connectTimeout(30, TimeUnit.SECONDS)
    .readTimeout(30, TimeUnit.MINUTES)
    .writeTimeout(30, TimeUnit.MINUTES)
    .build()

private val ink = Color(0xFF080B12)
private val panel = Color(0xFF111827)
private val cyan = Color(0xFF43E5E8)
private val muted = Color(0xFF9AA8BC)

@Composable
fun ArtexStudio() {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    var selected by remember { mutableStateOf<Uri?>(null) }
    var fileName by remember { mutableStateOf("") }
    var rights by remember { mutableStateOf(false) }
    var geminiKey by remember { mutableStateOf("") }
    var seconds by remember { mutableFloatStateOf(60f) }
    var status by remember { mutableStateOf("Tu estudio está listo. Selecciona un video para comenzar.") }
    var busy by remember { mutableStateOf(false) }
    var checking by remember { mutableStateOf(false) }
    var serverOnline by remember { mutableStateOf<Boolean?>(null) }
    var outputs by remember { mutableStateOf(listOf<String>()) }
    var fullVideoUrl by remember { mutableStateOf<String?>(null) }

    val picker = rememberLauncherForActivityResult(ActivityResultContracts.OpenDocument()) { uri ->
        selected = uri
        if (uri != null) {
            runCatching { context.contentResolver.takePersistableUriPermission(uri, android.content.Intent.FLAG_GRANT_READ_URI_PERMISSION) }
            fileName = context.contentResolver.query(uri, null, null, null, null)?.use { c ->
                val ix = c.getColumnIndex(OpenableColumns.DISPLAY_NAME)
                if (c.moveToFirst() && ix >= 0) c.getString(ix) else "video seleccionado"
            } ?: "video seleccionado"
            status = "Video seleccionado. Confirma tus derechos para continuar."
            outputs = emptyList()
            fullVideoUrl = null
        }
    }

    MaterialTheme(colorScheme = darkColorScheme(primary = cyan, onPrimary = ink, background = ink, surface = panel, onSurface = Color.White, secondary = Color(0xFF9B8CFF))) {
        Column(
            Modifier.fillMaxSize().background(Brush.verticalGradient(listOf(Color(0xFF111B2D), ink, Color(0xFF07090E))))
                .verticalScroll(rememberScrollState()).padding(horizontal = 20.dp, vertical = 18.dp),
            verticalArrangement = Arrangement.spacedBy(18.dp)
        ) {
            Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                Box(Modifier.size(42.dp).background(Brush.linearGradient(listOf(cyan, Color(0xFF438BFF))), RoundedCornerShape(13.dp)), contentAlignment = Alignment.Center) {
                    Text("A", color = ink, fontSize = 26.sp, fontWeight = FontWeight.Black)
                }
                Spacer(Modifier.width(11.dp))
                Column(Modifier.weight(1f)) {
                    Text("ARTEX", color = Color.White, fontSize = 20.sp, fontWeight = FontWeight.Black, letterSpacing = 2.sp)
                    Text("CLIPPER AI  /  VIDEO STUDIO", color = muted, fontSize = 9.sp, letterSpacing = 1.5.sp)
                }
                Surface(color = Color(0xFF12323A), shape = CircleShape) {
                    Text("BETA", Modifier.padding(horizontal = 12.dp, vertical = 7.dp), color = cyan, fontSize = 10.sp, fontWeight = FontWeight.Bold)
                }
            }

            Card(modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(25.dp), colors = CardDefaults.cardColors(containerColor = Color.Transparent)) {
                Box(Modifier.background(Brush.linearGradient(listOf(Color(0xFF153D4B), Color(0xFF18233B), Color(0xFF242044)))).padding(22.dp)) {
                    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                        Text("CREA CONTENIDO QUE ATRAPA", color = cyan, fontSize = 10.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.8.sp)
                        Text("De un video largo a clips listos para compartir.", color = Color.White, fontSize = 27.sp, lineHeight = 33.sp, fontWeight = FontWeight.Bold)
                        Text("Prepara fragmentos verticales con nuestro motor de escenas.", color = Color(0xFFD0D9E8), fontSize = 13.sp, lineHeight = 19.sp)
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.padding(top = 4.dp)) {
                            FeaturePill("9:16 VERTICAL")
                            FeaturePill("H.264 + AUDIO")
                        }
                    }
                }
            }

            Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                Text("TU PROYECTO", color = Color.White, fontSize = 14.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.sp)
                Spacer(Modifier.weight(1f))
                Text("PASO 01 / 03", color = muted, fontSize = 10.sp)
            }

            Card(shape = RoundedCornerShape(22.dp), colors = CardDefaults.cardColors(containerColor = panel)) {
                Column(Modifier.fillMaxWidth().padding(18.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text("01", color = cyan, fontSize = 13.sp, fontWeight = FontWeight.Bold)
                        Spacer(Modifier.width(10.dp))
                        Text("Selecciona tu video", color = Color.White, fontSize = 17.sp, fontWeight = FontWeight.SemiBold)
                    }
                    Box(Modifier.fillMaxWidth().background(Color(0xFF0B1220), RoundedCornerShape(17.dp)).padding(18.dp), contentAlignment = Alignment.Center) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(8.dp)) {
                            Text(if (selected == null) "＋" else "✓", color = cyan, fontSize = 32.sp)
                            Text(if (selected == null) "Añade un video desde tu teléfono" else fileName, color = Color.White, fontSize = 14.sp, fontWeight = FontWeight.Medium)
                            Text("MP4 · MOV · MKV · WEBM  |  Hasta 250 MB", color = muted, fontSize = 10.sp)
                            OutlinedButton(onClick = { picker.launch(arrayOf("video/*")) }, shape = RoundedCornerShape(12.dp)) {
                                Text(if (selected == null) "Elegir video" else "Cambiar video")
                            }
                        }
                    }
                    Text("02  /  Inteligencia artificial gratuita", color = Color.White, fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
                    OutlinedTextField(value = geminiKey, onValueChange = { geminiKey = it }, modifier = Modifier.fillMaxWidth(), singleLine = true, label = { Text("Clave Gemini de Google AI Studio (opcional)") }, placeholder = { Text("Pega tu API key gratuita") }, visualTransformation = androidx.compose.ui.text.input.PasswordVisualTransformation(), colors = OutlinedTextFieldDefaults.colors(focusedTextColor = Color.White, unfocusedTextColor = Color.White, focusedBorderColor = cyan, unfocusedBorderColor = Color(0xFF40516A), focusedLabelColor = cyan, unfocusedLabelColor = muted))
                    Text("Sin clave: crea clips automáticamente por duración. Con clave gratuita: ARTEX analiza fotogramas y elige momentos con gancho, emoción y potencial para redes. La clave solo se usa durante este envío.", color = muted, fontSize = 11.sp, lineHeight = 16.sp)
                    Text("03  /  Duración máxima de cada clip", color = Color.White, fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
                    Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                        Slider(value = seconds, onValueChange = { seconds = it }, valueRange = 15f..240f, modifier = Modifier.weight(1f))
                        Spacer(Modifier.width(10.dp))
                        Surface(color = Color(0xFF203746), shape = RoundedCornerShape(10.dp)) {
                            Text("${seconds.toInt()} s", Modifier.padding(horizontal = 12.dp, vertical = 8.dp), color = cyan, fontWeight = FontWeight.Bold)
                        }
                    }
                    HorizontalDivider(color = Color(0xFF273348))
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Checkbox(checked = rights, onCheckedChange = { rights = it })
                        Text("Confirmo que soy propietario del video o tengo autorización para editarlo.", color = muted, fontSize = 11.sp, lineHeight = 15.sp)
                    }
                    Button(
                        onClick = {
                            val uri = selected ?: return@Button
                            scope.launch {
                                busy = true
                                status = "Subiendo video al estudio…"
                                outputs = emptyList()
                                fullVideoUrl = null
                                try {
                                    val result = withContext(Dispatchers.IO) {
                                        val mime = context.contentResolver.getType(uri) ?: "video/mp4"
                                        val videoBody = object : RequestBody() {
                                            override fun contentType() = mime.toMediaTypeOrNull()
                                            override fun contentLength(): Long = runCatching { context.contentResolver.openAssetFileDescriptor(uri, "r")?.use { it.length } ?: -1L }.getOrDefault(-1L)
                                            override fun writeTo(sink: BufferedSink) {
                                                context.contentResolver.openInputStream(uri)?.use { input -> input.copyTo(sink.outputStream()) } ?: error("No se pudo leer el video.")
                                            }
                                        }
                                        val body = MultipartBody.Builder().setType(MultipartBody.FORM)
                                            .addFormDataPart("max_clip_seconds", seconds.toInt().toString())
                                            .addFormDataPart("file", fileName.ifBlank { "video.mp4" }, videoBody)
                                            .build()
                                        val req = Request.Builder().url("$API_BASE/api/jobs").header("X-Content-Rights", "confirmed").apply { if (geminiKey.isNotBlank()) header("X-Gemini-Api-Key", geminiKey.trim()) }.post(body).build()
                                        var state = http.newCall(req).execute().use { r ->
                                            if (!r.isSuccessful) error(r.body?.string() ?: "No se pudo subir el video.")
                                            JSONObject(r.body!!.string())
                                        }
                                        val id = state.getString("id")
                                        while (state.optString("status") == "queued" || state.optString("status") == "processing") {
                                            val message = state.optString("message", "Analizando escenas…")
                                            withContext(Dispatchers.Main) { status = message }
                                            kotlinx.coroutines.delay(2500)
                                            val poll = Request.Builder().url("$API_BASE/api/jobs/$id").get().build()
                                            state = http.newCall(poll).execute().use { r ->
                                                if (!r.isSuccessful) error("Se perdió la conexión con el procesamiento.")
                                                JSONObject(r.body!!.string())
                                            }
                                        }
                                        if (state.optString("status") != "completed") error(state.optString("error", "El procesamiento no pudo completarse."))
                                        val clips = state.getJSONArray("clips")
                                        val clipUrls = (0 until clips.length()).map { API_BASE + clips.getJSONObject(it).getString("url") }
                                        val full = state.optJSONObject("full_video")?.optString("url")?.takeIf { it.isNotBlank() }?.let { API_BASE + it }
                                        val aiWarning = state.optString("ai_warning")
                                        Pair(clipUrls, full to aiWarning)
                                    }
                                    outputs = result.first
                                    fullVideoUrl = result.second.first
                                    status = "Video completo terminado. " + result.first.size + " clips adicionales creados." + if (result.second.second.isNotBlank()) " La IA falló y se usó el modo automático." else ""
                                } catch (e: Exception) {
                                    status = e.message ?: "Ocurrió un error procesando el video."
                                } finally { busy = false }
                            }
                        },
                        enabled = selected != null && rights && !busy,
                        modifier = Modifier.fillMaxWidth().height(54.dp),
                        shape = RoundedCornerShape(15.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = cyan, disabledContainerColor = Color(0xFF344252))
                    ) {
                        if (busy) {
                            CircularProgressIndicator(Modifier.size(19.dp), color = ink, strokeWidth = 2.dp)
                            Spacer(Modifier.width(10.dp))
                            Text("PROCESANDO VIDEO", color = ink, fontWeight = FontWeight.Bold)
                        } else Text("✦  CREAR MIS CLIPS", color = ink, fontWeight = FontWeight.Black, letterSpacing = 1.sp)
                    }
                }
            }

            Card(shape = RoundedCornerShape(18.dp), colors = CardDefaults.cardColors(containerColor = Color(0xFF101A27))) {
                Column(Modifier.fillMaxWidth().padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(Modifier.size(8.dp).background(if (busy) Color(0xFFFFC857) else if (outputs.isNotEmpty() || fullVideoUrl != null) cyan else Color(0xFF77869B), CircleShape))
                        Spacer(Modifier.width(9.dp))
                        Text("ESTADO DEL PROYECTO", color = Color.White, fontSize = 11.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.sp)
                    }
                    Text(status, color = if (outputs.isNotEmpty() || fullVideoUrl != null) cyan else Color(0xFFD5DEEA), fontSize = 13.sp, lineHeight = 19.sp)
                }
            }

            if (fullVideoUrl != null) {
                Card(shape = RoundedCornerShape(18.dp), colors = CardDefaults.cardColors(containerColor = Color(0xFF153D4B))) {
                    Column(Modifier.fillMaxWidth().padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Column(Modifier.weight(1f)) {
                                Text("VIDEO COMPLETO TERMINADO", color = cyan, fontWeight = FontWeight.Black, fontSize = 12.sp)
                                Text("Desde el inicio hasta el último segundo · vertical MP4", color = Color.White, fontSize = 10.sp)
                            }
                            Button(onClick = { downloadFullVideo(context, fullVideoUrl!!) }, shape = RoundedCornerShape(11.dp)) { Text("Descargar") }
                        }
                        VideoPreview(fullVideoUrl!!)
                    }
                }
            }
            if (outputs.isNotEmpty()) {
                Text("TUS CLIPS  ·  ${outputs.size} RESULTADOS", color = Color.White, fontSize = 14.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.sp)
                outputs.forEachIndexed { index, url ->
                    Card(shape = RoundedCornerShape(16.dp), colors = CardDefaults.cardColors(containerColor = panel)) {
                        Column(Modifier.fillMaxWidth().padding(14.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Box(Modifier.size(42.dp).background(Color(0xFF183641), RoundedCornerShape(12.dp)), contentAlignment = Alignment.Center) { Text("▶", color = cyan, fontSize = 16.sp) }
                                Spacer(Modifier.width(12.dp))
                                Column(Modifier.weight(1f)) {
                                    Text("Clip ${index + 1}", color = Color.White, fontWeight = FontWeight.SemiBold)
                                    Text("Video vertical · MP4", color = muted, fontSize = 11.sp)
                                }
                                Button(onClick = { downloadClip(context, url, index + 1) }, shape = RoundedCornerShape(11.dp), contentPadding = PaddingValues(horizontal = 13.dp, vertical = 8.dp)) {
                                    Text("Descargar", fontSize = 12.sp)
                                }
                            }
                            VideoPreview(url)
                        }
                    }
                }
            }

            Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                Text("SERVIDOR", color = muted, fontSize = 10.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.sp)
                Spacer(Modifier.weight(1f))
                Text(when (serverOnline) { true -> "EN LÍNEA"; false -> "SIN CONEXIÓN"; null -> "VERIFICAR" },
                    color = when (serverOnline) { true -> cyan; false -> Color(0xFFFF7979); null -> muted }, fontSize = 10.sp, fontWeight = FontWeight.Bold)
                Spacer(Modifier.width(8.dp))
                TextButton(enabled = !checking, onClick = {
                    scope.launch {
                        checking = true
                        serverOnline = withContext(Dispatchers.IO) {
                            try {
                                val req = Request.Builder().url("$API_BASE/health").get().build()
                                http.newCall(req).execute().use { it.isSuccessful && JSONObject(it.body!!.string()).optBoolean("ok") }
                            } catch (_: Exception) { false }
                        }
                        checking = false
                    }
                }) { Text(if (checking) "…" else "Probar", color = cyan, fontSize = 11.sp) }
            }
            Text("ARTEX CLIPPER AI · Exporta el video completo y crea clips adicionales. Gemini analiza fotogramas cuando configuras una clave gratuita.", color = Color(0xFF718096), fontSize = 10.sp, lineHeight = 15.sp)
            Spacer(Modifier.height(12.dp))
        }
    }
}

@Composable
private fun VideoPreview(url: String) {
    AndroidView(
        modifier = Modifier.fillMaxWidth().height(310.dp),
        factory = { context ->
            VideoView(context).apply {
                tag = url
                val controls = MediaController(context)
                controls.setAnchorView(this)
                setMediaController(controls)
                setVideoURI(Uri.parse(url))
            }
        },
        update = { view ->
            if (view.tag != url) {
                view.tag = url
                view.setVideoURI(Uri.parse(url))
            }
        }
    )
}

@Composable
private fun FeaturePill(label: String) {
    Surface(color = Color(0x3329D7E3), shape = RoundedCornerShape(8.dp)) {
        Text(label, Modifier.padding(horizontal = 10.dp, vertical = 6.dp), color = cyan, fontSize = 9.sp, fontWeight = FontWeight.Bold)
    }
}

private fun downloadClip(context: Context, url: String, number: Int) {
    val request = DownloadManager.Request(Uri.parse(url))
        .setTitle("ARTEX CLIPPER · Clip $number")
        .setDescription("Guardando tu video en Descargas")
        .setMimeType("video/mp4")
        .setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)
        .setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, "ARTEX_clip_$number.mp4")
        .setAllowedOverMetered(true)
        .setAllowedOverRoaming(false)
    (context.getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager).enqueue(request)
}

private fun downloadFullVideo(context: Context, url: String) {
    val request = DownloadManager.Request(Uri.parse(url))
        .setTitle("ARTEX CLIPPER · Video completo")
        .setDescription("Guardando el video completo en Descargas")
        .setMimeType("video/mp4")
        .setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)
        .setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, "ARTEX_video_completo.mp4")
        .setAllowedOverMetered(true)
        .setAllowedOverRoaming(false)
    (context.getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager).enqueue(request)
}