plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
}

val hasReleaseSigning = listOf(
    "AMYFX_KEYSTORE_PATH",
    "AMYFX_KEYSTORE_PASSWORD",
    "AMYFX_KEY_PASSWORD"
).all { !System.getenv(it).isNullOrBlank() }

fun buildConfigString(value: String): String =
    "\"${value.replace("\\", "\\\\").replace("\"", "\\\"")}\""

// Amy FX Pro is promoted from the Preview lineage. Keep the registered Preview
// package and URI for Firebase/data/deep-link continuity, but use the Pro label,
// version line, and dedicated Pro update channel.
val configuredApplicationId = System.getenv("AMYFX_APPLICATION_ID") ?: "com.amyelitesuite.learningpreview"
val configuredAppLabel = System.getenv("AMYFX_APP_LABEL") ?: "Amy FX Pro"
val configuredUriScheme = System.getenv("AMYFX_URI_SCHEME") ?: "amyfxpreview"
val configuredUpdateManifestUrl = System.getenv("AMYFX_UPDATE_MANIFEST_URL")
    ?: "https://raw.githubusercontent.com/suhaimitoamy/Amy-fx-pro/main/update.json"
val configuredTwelveDataApiKey = "" // Provider credential is server-only.

android {
    namespace = "com.amyelitesuite"
    compileSdk = 35

    defaultConfig {
        applicationId = configuredApplicationId
        minSdk = 26
        targetSdk = 35
        versionCode = (System.getenv("AMYFX_VERSION_CODE")?.toIntOrNull() ?: 950421)
        versionName = System.getenv("AMYFX_VERSION_NAME") ?: "2.0.0-pro.421"
        manifestPlaceholders["appLabel"] = configuredAppLabel
        manifestPlaceholders["amyFxScheme"] = configuredUriScheme
        buildConfigField("String", "UPDATE_MANIFEST_URL", buildConfigString(configuredUpdateManifestUrl))
        buildConfigField("String", "TWELVEDATA_API_KEY", buildConfigString(configuredTwelveDataApiKey))
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    signingConfigs {
        create("release") {
            if (hasReleaseSigning) {
                storeFile = file(System.getenv("AMYFX_KEYSTORE_PATH")!!)
                storePassword = System.getenv("AMYFX_KEYSTORE_PASSWORD")
                keyAlias = "amyfx"
                keyPassword = System.getenv("AMYFX_KEY_PASSWORD")
                enableV1Signing = true
                enableV2Signing = true
            }
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            if (hasReleaseSigning) {
                signingConfig = signingConfigs.getByName("release")
            }
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
    buildFeatures {
        viewBinding = true
        buildConfig = true
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.appcompat)
    implementation(libs.material)
    implementation(libs.androidx.activity)
    implementation(libs.androidx.constraintlayout)
    implementation(libs.androidx.webkit)
    implementation(libs.androidx.swiperefreshlayout)
    implementation(libs.androidx.security.crypto)
    implementation(libs.okhttp)
    implementation(libs.androidx.media3.exoplayer)
    implementation(libs.androidx.media3.ui)
    implementation(libs.androidx.media3.session)
    implementation(libs.androidx.work.runtime.ktx)
    implementation(platform(libs.firebase.bom))
    implementation(libs.firebase.messaging)
    testImplementation(libs.junit)
    androidTestImplementation(libs.androidx.junit)
    androidTestImplementation(libs.androidx.espresso.core)
}
