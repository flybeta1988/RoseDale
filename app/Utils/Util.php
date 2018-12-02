<?php

namespace App\Utils;


use Illuminate\Support\Facades\Log;

class Util
{
    const CAPTCHA_SECRET = '6Lc_RX4UAAAAADMT1gn5azbvRVmHGA9MZrEyL7mw';
    const CAPTCHA_VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify';

    public static function recaptchaVerify($response) {

        $params = array(
            'secret' => self::CAPTCHA_SECRET,
            'response' => $response,
        );
        $result = self::curlPost(self::CAPTCHA_VERIFY_URL, $params);
        Log::info(__METHOD__. ': '. var_export($result, true));
        return $result;
    }

    public static function recaptchaVerifyV2($response) {
        $post_data = http_build_query(
            array(
                'secret' => self::CAPTCHA_SECRET,
                'response' => $response,
                'remoteip' => $_SERVER['REMOTE_ADDR']
            )
        );
        $opts = array('http' =>
            array(
                'method'  => 'POST',
                'header'  => 'Content-type: application/x-www-form-urlencoded',
                'content' => $post_data
            )
        );
        $context  = stream_context_create($opts);
        $response = file_get_contents(self::CAPTCHA_VERIFY_URL, false, $context);
        $result = json_decode($response, true);
        Log::info(__METHOD__. ': '. var_export($result, true));
        return $result;
    }

    public static function curlPost($url, array $post_data) {
        Log::info(__METHOD__. " url: {$url}");
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);

        if ($post_data) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($post_data));
            curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/x-www-form-urlencoded'));
        }

        $output = curl_exec($ch);

        if ($output) {
            curl_close($ch);
            return $output;
        } else {
            $error = curl_errno($ch);
            curl_close($ch);
            return ("curl出错，错误码: $error");
        }
    }
}