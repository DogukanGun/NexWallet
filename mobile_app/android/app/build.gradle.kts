plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
    alias(libs.plugins.google.android.libraries.mapsplatform.secrets.gradle.plugin)
    id("kotlin-kapt")
    id("com.google.dagger.hilt.android")
    id("com.google.devtools.ksp")
    kotlin("plugin.serialization")
    id("com.google.gms.google-services")
}

android {
    namespace = "com.dag.nexwallet"
    compileSdk = 35
    flavorDimensions += "version"
    testBuildType = "debug"
    
    // Add packaging configuration to exclude duplicate files
    packaging {
        resources {
            excludes += listOf(
                // Duplicate file issues
                "META-INF/versions/9/OSGI-INF/MANIFEST.MF",
                "META-INF/MANIFEST.MF",
                "META-INF/LICENSE.md", 
                "META-INF/LICENSE-notice.md",
                
                // Signature files that cause security exceptions
                "META-INF/*.SF",
                "META-INF/*.DSA",
                "META-INF/*.RSA",
                "META-INF/*.EC",
                "META-INF/*.MF",
                
                // Other common conflicts
                "META-INF/INDEX.LIST",
                "META-INF/DEPENDENCIES",
                "META-INF/NOTICE",
                "META-INF/LICENSE",
                "META-INF/ASL2.0",
                "META-INF/AL2.0",
                "META-INF/LGPL2.1",
                "META-INF/proguard/**"
            )
            // Remove pickFirsts as it can cause conflicts with signature verification
            // pickFirsts += "META-INF/*"
        }
        jniLibs {
            useLegacyPackaging = true
        }
    }
    
    productFlavors {
        create("localB"){
            dimension = "version"
            versionNameSuffix = "-lcl"
        }
        create("relaseB"){
            dimension = "version"
            versionNameSuffix = "-rls"
        }
    }

    defaultConfig {
        applicationId = "com.dag.nexwallet"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "1.0"
        multiDexEnabled = true
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"

        productFlavors {
            getByName("relaseB") {
                buildConfigField(
                    "String",
                    "BASE_URL",
                    "\"https://bacai.nexarb.com/\""
                )
                buildConfigField(
                    "String",
                    "BASE_FRONTEND_URL",
                    "\"https://solba.nexarb.com/api/\""
                )
            }
            getByName("localB"){
                buildConfigField(
                    "String",
                    "BASE_URL",
                    "\"http://10.0.0.1:8000/\""
                )
                buildConfigField(
                    "String",
                    "BASE_FRONTEND_URL",
                    "\"https://solba.nexarb.com/api/\""
                )
            }
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            isDebuggable = false
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }
    kotlinOptions {
        jvmTarget = "11"
    }
    buildFeatures {
        compose = true
        buildConfig = true
    }
}

dependencies {

    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.lifecycle.viewmodel.compose)
    implementation(libs.androidx.activity.compose)
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.ui)
    implementation(libs.androidx.ui.graphics)
    implementation(libs.androidx.ui.tooling.preview)
    implementation(libs.androidx.material3)
    implementation(libs.firebase.vertexai)
    implementation(libs.vision.internal.vkp)
    testImplementation(libs.junit)
    
    // Test dependencies with fixed versions
    androidTestImplementation("androidx.test.ext:junit:1.1.5")
    androidTestImplementation("androidx.test.espresso:espresso-core:3.5.1")
    androidTestImplementation(platform("androidx.compose:compose-bom:2024.02.00"))
    androidTestImplementation("androidx.compose.ui:ui-test-junit4")
    debugImplementation("androidx.compose.ui:ui-tooling")
    debugImplementation("androidx.compose.ui:ui-test-manifest")

    //HILT
    implementation(libs.androidx.hilt.navigation.fragment)
    implementation(libs.androidx.hilt.navigation.compose)
    implementation(libs.hilt.android)
    androidTestImplementation(libs.hilt.android.testing)
    testImplementation(libs.hilt.android.testing)
    kaptTest(libs.hilt.android.compiler)
    kaptAndroidTest(libs.hilt.android.compiler)
    kapt(libs.hilt.android.compiler)
    implementation(libs.androidx.hilt.work)
    //Serialization
    implementation(libs.kotlinx.serialization.json)

    //Navigation
    implementation(libs.androidx.navigation.compose)
    implementation(libs.androidx.work.runtime.ktx)

    //Multidex
    implementation(libs.androidx.multidex)

    //Network
    implementation(libs.okhttp)
    implementation(libs.retrofit)
    implementation(libs.converter.gson)
    implementation(libs.logging.interceptor)

    //Datastore
    implementation(libs.androidx.datastore.preferences)

    //Firebase
    implementation(platform(libs.firebase.bom))
    implementation(libs.firebase.ai)
    implementation(libs.firebase.auth.ktx)
    implementation(libs.firebase.analytics.ktx)
    implementation(libs.firebase.analytics)

    //Solana
    implementation(libs.mobile.wallet.adapter.clientlib.ktx)
    implementation(libs.web3.solana)
    implementation(libs.rpc.core)
    implementation(libs.multimult)

    //EncryptedSharedPreferences
    implementation(libs.androidx.security.crypto)

    //Coil
    implementation(libs.coil3.coil.compose)

    //Ktor
    implementation(libs.ktor.client.core)
    implementation(libs.ktor.client.cio)
    implementation(libs.ktor.client.logging)
    implementation(libs.ktor.client.auth)
    implementation(libs.ktor.client.content.negotiation)
    implementation(libs.ktor.client.json)
    implementation(libs.ktor.serialization.kotlinx.json)
    implementation(libs.ktor.serialization.gson)
    implementation("io.ktor:ktor-client-okhttp:3.1.3")
    //Stellar
    implementation(libs.wallet.sdk)

    //Chucker
    debugImplementation("com.github.chuckerteam.chucker:library:4.1.0")
}