package com.dag.nexwallet.features.home.data.datasource

<<<<<<< HEAD
import com.dag.nexwallet.features.home.domain.model.GetMyAgentsResponse
import com.dag.nexwallet.features.home.domain.repository.IMyAgentsService
import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.request.get
import io.ktor.client.request.post
import io.ktor.client.request.setBody
import io.ktor.http.HttpStatusCode
import javax.inject.Inject
import javax.inject.Named
import javax.inject.Singleton

@Singleton
class MyAgentsService @Inject constructor(@Named("AuthorizedKtor") val ktor: HttpClient)
    : IMyAgentsService{
    override suspend fun getMyAgents(): List<GetMyAgentsResponse> {
        val res = ktor.get("/agent/my")
        return when(res.status) {
            HttpStatusCode.OK -> res.body()
            else -> {
                val errorBody = try {
                    res.body<String>()
                } catch (e: Exception) {
                    "Unknown error"
                }
                throw Exception("API Error: ${res.status.value} - $errorBody")
            }
        }
    }
=======
class MyAgentsService {
>>>>>>> feat/lilypad_integration
}