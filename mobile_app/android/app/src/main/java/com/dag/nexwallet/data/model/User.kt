package com.dag.nexwallet.data.model

import kotlinx.serialization.Serializable

@Serializable
data class User(
    val id: String,
    val name: String,
    val username: String,
    val profileImageUrl: String,
    val bannerImageUrl: String?,
    val description: String?,
    val location: String?,
    val websiteUrl: String?,
    val followersCount: Int,
    val followingCount: Int,
    val isVerified: Boolean,
    val createdAt: String
) {
    companion object {
        fun fromTwitterProfile(profile: Map<String, Any?>): User {
            return User(
                id = profile["id_str"] as String,
                name = profile["name"] as String,
                username = profile["screen_name"] as String,
                profileImageUrl = profile["profile_image_url_https"] as String,
                bannerImageUrl = profile["profile_banner_url"] as? String,
                description = profile["description"] as? String,
                location = profile["location"] as? String,
                websiteUrl = profile["url"] as? String,
                followersCount = (profile["followers_count"] as Number).toInt(),
                followingCount = (profile["friends_count"] as Number).toInt(),
                isVerified = profile["verified"] as Boolean,
                createdAt = profile["created_at"] as String
            )
        }
    }
} 