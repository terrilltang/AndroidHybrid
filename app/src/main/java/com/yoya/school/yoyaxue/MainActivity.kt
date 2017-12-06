package com.yoya.school.yoyaxue

import android.annotation.SuppressLint
import android.app.DownloadManager
import android.content.Context
import android.graphics.Color
import android.support.v7.app.AppCompatActivity
import android.os.Bundle

import android.webkit.WebView
import android.webkit.WebViewClient
import android.webkit.WebChromeClient
import android.view.WindowManager
import android.os.Build
import android.content.Intent
import android.net.Uri
import android.util.Log
import android.webkit.JavascriptInterface

import android.webkit.CookieManager
import java.io.*
import java.net.URL


@SuppressLint("SetJavaScriptEnabled,addJavascriptInterface")

class MainActivity : AppCompatActivity() {


    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        setContentView(R.layout.activity_main)





        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            val window = this.window
            window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS)
            window.statusBarColor = Color.parseColor("#10b6f2")
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT && Build.VERSION.SDK_INT < Build.VERSION_CODES.LOLLIPOP) {
            //@TODO

        }


        val webview = this.findViewById<WebView>(R.id.webview) as WebView
        if (Build.VERSION.SDK_INT >= 21) {
            val cookieManager = CookieManager.getInstance()
            cookieManager.setAcceptThirdPartyCookies(webview, true)
        }

        val webviewSet = webview.settings
        webview.webViewClient = WebViewClient()
        webview.webChromeClient = WebChromeClient()
        webview.addJavascriptInterface(ExecuteJSMethod(), "NativeJSMethod")


        //setContentView(webview)

        webviewSet.useWideViewPort = true
        webviewSet.allowFileAccess = true
        webviewSet.javaScriptEnabled = true
        webviewSet.domStorageEnabled = true
        webviewSet.loadWithOverviewMode = true
        webviewSet.userAgentString = webviewSet.userAgentString + "-YOYA-XUE.ANDROID"
        if (Build.VERSION.SDK_INT >= 16) {
            webviewSet.allowFileAccessFromFileURLs = true
        }


        webview.loadUrl("file:///android_asset/mobile/dynamics.html")
    }


    internal inner class ExecuteJSMethod {
        @JavascriptInterface

         fun openUrl(uri: String, title: String) {

            val intent = Intent(this@MainActivity, ViewUrlActivity::class.java)
            val bun = Bundle()
            bun.putString("uri", uri)
            bun.putString("title", title)
            intent.putExtras(bun)
            startActivity(intent)
        }

        @JavascriptInterface

        fun syncCookies(uri: String) {
            Log.d("this@MainActivity","JS调用了Android的hello方法")
            Log.d("this@MainActivity",CookieManager.getInstance().getCookie(uri))

        }


    }

    companion object {

        // Used to load the 'native-lib' library on application startup.
        init {
            System.loadLibrary("native-lib")
        }


    }

}
