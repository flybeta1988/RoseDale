<?php

namespace App\Http\Controllers;

use App\Utils\Util;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class HomeController extends Controller
{
    public function index() {
        return view('home');
    }

    public function contactUs(Request $request) {

        $name = $request->name;
        $email = $request->email;
        $message = $request->message;
        $g_recaptcha_response = $request->get('g-recaptcha-response');
        Log::info($g_recaptcha_response);

        $data = Util::recaptchaVerifyV2($g_recaptcha_response);
        if (isset($data['success']) && $data['success']) {
            $msg = '验证成功';
        } else {
            $msg = '验证失败';
        }

        $result = array(
            'msg' => $msg,
            'name' => $name,
            'email' => $email
        );
        return $result;
    }
}
