package com.dag.nexwallet.data.repository

import com.dag.nexwallet.data.local.SecureStorage
import com.dag.nexwallet.data.model.User
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class UserRepository @Inject constructor(
    private val secureStorage: SecureStorage
) {
    fun saveUser(user: User): Result<Unit> {
        return try {
            with(secureStorage) {
                saveString(SecureStorage.KEY_USER_ID, user.id)
                saveString(SecureStorage.KEY_USER_NAME, user.name)
                saveString(SecureStorage.KEY_USERNAME, user.username)
                saveString(SecureStorage.KEY_PROFILE_IMAGE_URL, user.profileImageUrl)
                saveString(SecureStorage.KEY_BANNER_IMAGE_URL, user.bannerImageUrl)
                saveString(SecureStorage.KEY_DESCRIPTION, user.description)
                saveString(SecureStorage.KEY_LOCATION, user.location)
                saveString(SecureStorage.KEY_WEBSITE_URL, user.websiteUrl)
                saveInt(SecureStorage.KEY_FOLLOWERS_COUNT, user.followersCount)
                saveInt(SecureStorage.KEY_FOLLOWING_COUNT, user.followingCount)
                saveBoolean(SecureStorage.KEY_IS_VERIFIED, user.isVerified)
                saveString(SecureStorage.KEY_CREATED_AT, user.createdAt)
                saveLong("last_updated", System.currentTimeMillis())
            }
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    fun saveToken(token: String): Result<Unit> {
        return try {
            with(secureStorage) {
               saveString(SecureStorage.KEY_TOKEN,token)
            }
            Result.success(Unit)
        }catch (e: Exception) {
            Result.failure(e)
        }
    }

    fun getUser(): Result<User?> {
        return try {
            with(secureStorage) {
                val userId = getString(SecureStorage.KEY_USER_ID)
                if (userId != null) {
                    Result.success(User(
                        id = userId,
                        name = getString(SecureStorage.KEY_USER_NAME) ?: "",
                        username = getString(SecureStorage.KEY_USERNAME) ?: "",
                        profileImageUrl = getString(SecureStorage.KEY_PROFILE_IMAGE_URL) ?: "",
                        bannerImageUrl = getString(SecureStorage.KEY_BANNER_IMAGE_URL),
                        description = getString(SecureStorage.KEY_DESCRIPTION),
                        location = getString(SecureStorage.KEY_LOCATION),
                        websiteUrl = getString(SecureStorage.KEY_WEBSITE_URL),
                        followersCount = getInt(SecureStorage.KEY_FOLLOWERS_COUNT),
                        followingCount = getInt(SecureStorage.KEY_FOLLOWING_COUNT),
                        isVerified = getBoolean(SecureStorage.KEY_IS_VERIFIED),
                        createdAt = getString(SecureStorage.KEY_CREATED_AT) ?: ""
                    ))
                } else {
                    Result.success(null)
                }
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    fun getToken(): Result<String?> {
        return try {
            with(secureStorage) {
                val userId = getString(SecureStorage.KEY_USER_ID)
                if (userId != null) {
                    Result.success(getString(SecureStorage.KEY_TOKEN))
                } else {
                    Result.success(null)
                }
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    fun clearUser() {
        secureStorage.clear()
    }
} 