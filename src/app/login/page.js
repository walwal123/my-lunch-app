'use client';
import Link from 'next/link';
import './main.css';
import './login.css';

export default function LoginPage() {
    return (
        <div className="main">
            <div className="nav">
                <div className="nav_box">
                    <img src="/img/free-icon-sandwich-454602.png" className="main_icon" />
                    <p className="nav_main">점심의 아이</p>
                </div>
                <div className="nav_box">
                    <img src="/img/calendar.png" className="nav_calendar_icon" />
                    <Link href="/login" className="nav_login">로그인/회원가입</Link>
                </div>
            </div>
            <div className="main_box">
                <div className="login_box">
                    <div className="login_top_box">
                        <img src="../img/free-icon-sandwich-454602.png" className="login_main_icon" />
                        <p className="login_title">Login</p>
                    </div>
                    <input type="text" id="user_id" placeholder="아이디" />
                    <input type="password" id="user_pw" placeholder="비밀번호" />
                    <input type="submit" id="login_btn" value="로그인" onClick={async () => {
                        const res = await fetch('/api/login', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                id: document.getElementById('user_id').value,
                                user_pw: document.getElementById('user_pw').value
                            })
                        });

                        if (res.ok) {
                            window.location.href = '/recommend';
                        } else {
                            alert('로그인 실패');
                        }
                    }} />
                    <div className="login_footer">
                        <Link href="/register">회원가입</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}