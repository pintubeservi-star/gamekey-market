package com.artex.clipper

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) { super.onCreate(savedInstanceState); setContent { Screen() } }
}

@Composable
fun Screen() {
    val bg = Color(0xFF090B10); val cyan = Color(0xFF35D7E8)
    var selected by remember { mutableStateOf<Uri?>(null) }
    var rights by remember { mutableStateOf(false) }
    var seconds by remember { mutableFloatStateOf(60f) }
    val picker = rememberLauncherForActivityResult(ActivityResultContracts.OpenDocument()) { selected = it }
    MaterialTheme(colorScheme = darkColorScheme(primary=cyan, background=bg, surface=Color(0xFF151A24))) {
        Column(Modifier.fillMaxSize().background(bg).padding(22.dp), verticalArrangement=Arrangement.spacedBy(18.dp)) {
            Text("ARTEX CLIPPER", color=Color.White, fontSize=23.sp, style=MaterialTheme.typography.headlineSmall)
            Text("AI VIDEO STUDIO", color=cyan, letterSpacing=4.sp, fontSize=11.sp)
            Text("Convierte videos largos en clips verticales.", color=Color.White, fontSize=28.sp)
            Card(colors=CardDefaults.cardColors(containerColor=Color(0xFF151A24)), shape=RoundedCornerShape(20.dp)) {
                Column(Modifier.fillMaxWidth().padding(18.dp), verticalArrangement=Arrangement.spacedBy(14.dp)) {
                    Text(selected?.lastPathSegment ?: "Selecciona un video", color=Color.White)
                    Button(onClick={ picker.launch(arrayOf("video/*")) }, modifier=Modifier.fillMaxWidth()) { Text("Elegir video") }
                    Text("Duración máxima: ${seconds.toInt()} segundos", color=Color.White)
                    Slider(value=seconds, onValueChange={seconds=it}, valueRange=15f..240f)
                    Row(verticalAlignment=Alignment.CenterVertically) {
                        Checkbox(checked=rights, onCheckedChange={rights=it})
                        Text("Tengo derechos o autorización para usar este video.", color=Color.LightGray, fontSize=12.sp)
                    }
                    Button(onClick={}, enabled=selected!=null && rights, modifier=Modifier.fillMaxWidth()) { Text("Conectar con motor de clips (pendiente)") }
                }
            }
            Text("Esta compilación inicial selecciona archivos. El envío al servidor y la descarga de clips se habilitarán al conectar la API.", color=Color.Gray, fontSize=12.sp)
        }
    }
}
