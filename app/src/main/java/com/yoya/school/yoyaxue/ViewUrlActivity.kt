package com.yoya.school.yoyaxue

import android.annotation.SuppressLint
import android.content.res.Configuration
import android.content.res.Resources
import android.graphics.Color
import android.os.Build
import android.support.v7.widget.Toolbar
import android.support.v7.app.AppCompatActivity
import android.os.Bundle
import android.view.View
import android.view.WindowManager
import android.webkit.WebChromeClient
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.*

@SuppressLint("SetJavaScriptEnabled")

class ViewUrlActivity : AppCompatActivity() {

    private var title:String=""
    private var uri:String=""

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_view_url)

        this.detectOrientation()
        val intent = intent
        title = intent.extras["title"].toString()
        uri = intent.extras["uri"].toString()
        val textView=this.findViewById<TextView>(R.id.textView) as TextView
        textView.text=title
        val button = this.findViewById<ImageButton>(R.id.button) as ImageButton
        button.setOnClickListener({
            System.out.println("点击了返回按钮")
            this.finish()
        })


        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            val window = this.window
            window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS)
            window.statusBarColor = Color.parseColor("#10b6f2")

        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT && Build.VERSION.SDK_INT < Build.VERSION_CODES.LOLLIPOP) {
            //@TODO StatusBar Color
        }




        val webview = this.findViewById<WebView>(R.id.webview) as WebView
        val webviewSet = webview.settings

        webview.webViewClient = WebViewClient()
        webview.webChromeClient = WebChromeClient()
        webviewSet.useWideViewPort = true
        webviewSet.allowFileAccess = true
        webviewSet.javaScriptEnabled = true
        webviewSet.domStorageEnabled = true
        webviewSet.loadWithOverviewMode = true
        webviewSet.supportZoom()
        webviewSet.builtInZoomControls=true
        webviewSet.setSupportZoom(true)
        webviewSet.userAgentString = webviewSet.userAgentString + "-YOYA-XUE.ANDROID"
        if (Build.VERSION.SDK_INT >= 16) {
            webviewSet.allowFileAccessFromFileURLs = true
        }
        webview.loadUrl(uri)
    }

    override fun onConfigurationChanged(newConfig: Configuration) {
        super.onConfigurationChanged(newConfig)
        this.detectOrientation()
    }

    private fun detectOrientation(){
        val config=resources.configuration
        val message = if (config.orientation == Configuration.ORIENTATION_LANDSCAPE) "屏幕设置为：横屏" else "屏幕设置为：竖屏"
        val linear=this.findViewById<LinearLayout>(R.id.linear) as LinearLayout
        if(config.orientation==Configuration.ORIENTATION_PORTRAIT){
            System.out.println(message)
            linear.visibility=View.VISIBLE
            window.clearFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN)
        }else{
            System.out.println(message)
            linear.visibility=View.GONE
            window.setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN, WindowManager.LayoutParams.FLAG_FULLSCREEN)
        }
    }

}
