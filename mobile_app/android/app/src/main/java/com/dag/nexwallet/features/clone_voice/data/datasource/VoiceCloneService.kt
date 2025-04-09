package com.dag.nexwallet.features.clone_voice.data.datasource

import com.dag.nexwallet.features.clone_voice.domain.model.SavedVoice
import com.dag.nexwallet.features.clone_voice.domain.model.VoiceCloneResponse
import com.dag.nexwallet.features.clone_voice.domain.repository.IVoiceCloneService
import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.request.forms.MultiPartFormDataContent
import io.ktor.client.request.forms.formData
import io.ktor.client.request.get
import io.ktor.client.request.header
import io.ktor.client.request.post
import io.ktor.client.request.setBody
import io.ktor.http.ContentType
import io.ktor.http.Headers
import io.ktor.http.HttpHeaders
import io.ktor.http.HttpStatusCode
import io.ktor.http.contentType
import io.ktor.utils.io.InternalAPI
import java.io.File
import javax.inject.Inject
import javax.inject.Named
import javax.inject.Singleton

@Singleton
class VoiceCloneService @Inject constructor(@Named("AuthorizedKtor") private val ktor: HttpClient) : IVoiceCloneService {
    
    @OptIn(InternalAPI::class)
    override suspend fun cloneVoice(voiceFile: File, voiceName: String?, shareForTraining: Boolean): VoiceCloneResponse {
        val response = ktor.post("/voice/clone") {
            body = MultiPartFormDataContent(
                formData {
                    append("voice", voiceFile.readBytes(), Headers.build {
                        append(HttpHeaders.ContentDisposition, "filename=${voiceFile.name}")
                    })
                    append("shareForTraining", shareForTraining.toString())
                    voiceName?.let { append("voiceName", it) }
                }
            )
            header("x-file-name", voiceFile.name)
            header("x-share-for-training", shareForTraining.toString())
        }
        
        return when (response.status) {
            HttpStatusCode.OK -> response.body()
            else -> {
                val errorBody = try {
                    response.body<String>()
                } catch (e: Exception) {
                    "Unknown error"
                }
                throw Exception("API Error: ${response.status.value} - $errorBody")
            }
        }
    }

    override suspend fun getMyVoices(): List<SavedVoice> {
        val response = ktor.get("/voice/my")
        
        return when (response.status) {
            HttpStatusCode.OK -> response.body()
            else -> {
                val errorBody = try {
                    response.body<String>()
                } catch (e: Exception) {
                    "Unknown error"
                }
                throw Exception("API Error: ${response.status.value} - $errorBody")
            }
        }
    }

    override suspend fun getMyIpfsVoices(): List<SavedVoice> {
        val response = ktor.get("/voice/ipfs")
        
        return when (response.status) {
            HttpStatusCode.OK -> response.body()
            else -> {
                val errorBody = try {
                    response.body<String>()
                } catch (e: Exception) {
                    "Unknown error"
                }
                throw Exception("API Error: ${response.status.value} - $errorBody")
            }
        }
    }
} 