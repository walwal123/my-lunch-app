'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './main.css';

export default function RecommendationPage() {
    const [keywords, setKeywords] = useState([]);
    const [location, setLocation] = useState('');
    const [result, setResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const [checkedIndex, setCheckedIndex] = useState(null);
    const [value, onChange] = useState(new Date());
    const [userName, setUserName] = useState(null);
    const [lunchData, setLunchData] = useState([]);

    const mapRef = useRef(null);

    useEffect(() => {
        const user_id = getCookie('user_id');
        if (!user_id) return;

        fetch(`/api/lunch?user_id=${user_id}`)
            .then(res => res.json())
            .then(data => {
                setLunchData(data.lunches || []);
            })
            .catch(err => console.error('점심 데이터 가져오기 실패', err));
    }, []);

    useEffect(() => {
        const name = getCookie('user_name');
        if (name) setUserName(name);
    }, []);

    function getCookie(name) {
        const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
        return match ? decodeURIComponent(match[2]) : null;
    }

    const handleLogout = () => {
        document.cookie = 'user_id=; Max-Age=0; path=/';
        document.cookie = 'user_name=; Max-Age=0; path=/';
        window.location.reload();
    };

    useEffect(() => {
        const script = document.createElement('script');
        script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=d0f5d32d4d1a7f29691a4a04411567a0&autoload=false`;
        script.async = true;

        script.onload = () => {
            window.kakao.maps.load(() => {
                const center = new window.kakao.maps.LatLng(37.5665, 126.9780);

                const map = new window.kakao.maps.Map(mapRef.current, {
                    center,
                    level: 4,
                });

                result.forEach(item => {
                    const lat = parseFloat(item.mapy) / 1e7;
                    const lng = parseFloat(item.mapx) / 1e7;

                    const markerPosition = new window.kakao.maps.LatLng(lat, lng);

                    const marker = new window.kakao.maps.Marker({
                        position: markerPosition,
                        map,
                    });

                    const iwContent = `<div style="padding:5px;font-size:12px;">${item.store}</div>`;
                    const infowindow = new window.kakao.maps.InfoWindow({
                        content: iwContent,
                    });

                    window.kakao.maps.event.addListener(marker, 'mouseover', () => {
                        infowindow.open(map, marker);
                    });

                    window.kakao.maps.event.addListener(marker, 'mouseout', () => {
                        infowindow.close();
                    });
                });
            });
        };

        document.head.appendChild(script);
    }, [result]);

    const handleTagClick = (tag) => {
        if (!keywords.includes(tag)) {
            setKeywords([...keywords, tag]);
        } else if (keywords.includes(tag)) {
            setKeywords(prev => prev.filter(t => t !== tag));
        }
    };

    const handleSubmit = async () => {
        if (!location || keywords.length === 0) {
            alert('동과 키워드를 모두 입력해주세요.');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/recommend', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ keywords, location })
            });

            const data = await res.json();
            setResult(data.data || []);
        } catch (err) {
            console.error(err);
            alert('추천에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveLunch = async () => {
        if (checkedIndex === null) {
            alert('메뉴를 선택해주세요!');
            return;
        }

        const selected = result[checkedIndex];
        const user_id = getCookie('user_id');

        if (!user_id) {
            alert('로그인이 필요합니다.');
            return;
        }

        try {
            const res = await fetch('/api/lunch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id,
                    lunch_name: selected.menu,
                    lunch_date: new Date().toISOString().split('T')[0] // YYYY-MM-DD
                }),
            });

            const data = await res.json();
            if (res.ok) {
                alert('점심이 저장되었습니다!');
            } else {
                alert(data.error || '저장에 실패했습니다.');
            }
        } catch (err) {
            console.error(err);
            alert('저장 중 오류 발생');
        }
    };

    return (
        <div className="main">

            {loading && (
                <div className="loading-modal">
                    <div className="loading-backdrop"></div>
                    <div className="loading-box">
                        <div className="spinner" />
                        <p className='loading-p'>추천 중입니다...</p>
                    </div>
                </div>
            )}

            <div className="nav">
                <div className="nav_box">
                    <img src="/img/free-icon-sandwich-454602.png" className="main_icon" />
                    <p className="nav_main">점심의 아이</p>
                </div>
                <div className="nav_box">
                    <img src="/img/calendar.png" className="nav_calendar_icon" />
                    {userName ? (
                        <>
                            <span className="nav_user">{userName}님/</span>
                            <button className="nav_logout" onClick={handleLogout}>로그아웃</button>
                        </>
                    ) : (
                        <Link href="/login" className="nav_login">로그인/회원가입</Link>
                    )}
                </div>
            </div>

            <div className="main_box">

                <p className="main_title">점심 메뉴 추천</p>

                <div className="selected-items">
                    {checkedIndex !== null && (
                        <p>오늘의 점심은 {result[checkedIndex].menu}!!</p>
                    )}
                </div>

                <div className="input_box">
                    <input
                        type="text"
                        id="tag_input"
                        className="recommend_input"
                        placeholder="아래의 키워드를 눌러 추가하세요!"
                        value={keywords.join(', ')}
                        disabled
                    />
                </div>
                <div className="location_box">
                    <input
                        type="text"
                        className="location_input"
                        placeholder="추천될 지역의 동 이름을 입력하세요!"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                    />
                </div>

                <div className="tag_box">
                    {['한식', '중식', '일식', '양식'].map((tag) => (
                        <button key={tag} onClick={() => handleTagClick(tag)}>
                            {tag}
                        </button>
                    ))}
                </div>

                <div className="input_box">
                    <input
                        type="submit"
                        value="추천하기!"
                        className="rcbtn"
                        onClick={handleSubmit}
                    />
                </div>

                <div className="list_box_main">
                    <div className="list_box">
                        <p id="list_box_title">추천된 메뉴들</p>
                        <div className='btn_box'>
                            <button id='lunch_save' onClick={handleSaveLunch}>결정하기</button>
                        </div>
                        {result.map((item, idx) => (
                            <div key={idx} className="list_box_row">
                                <div className="list_row_side">
                                    <input
                                        type="radio"
                                        name="menu-select"
                                        checked={checkedIndex === idx}
                                        onChange={() => setCheckedIndex(idx)}
                                    />
                                    <p className="store_tag">{item.store}</p>
                                </div>
                                <div className="list_row_side">
                                    <p className="food_tag">{item.menu}</p>
                                    <p className="store_add">{item.address}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className='map_box'>
                    <p className='map_title'>가게 위치</p>
                    <div className='kakao_map_box'>
                        <div
                            ref={mapRef}
                            style={{ width: '100%', height: '540px', border: '1px solid #ccc' }}
                        />
                    </div>
                </div>

                <div className='cel_box'>
                    <p className='cel_title'>나의 점심 기록</p>
                    <Calendar
                        onChange={onChange}
                        value={value}
                        tileContent={({ date, view }) => {
                            if (view === 'month') {
                                const dateStr = date.getFullYear() + '-' +
                                    String(date.getMonth() + 1).padStart(2, '0') + '-' +
                                    String(date.getDate()).padStart(2, '0');

                                const lunch = lunchData.find(
                                    (item) => item.lunch_date.split('T')[0] === dateStr
                                );
                                return lunch ? (
                                    <div style={{ fontSize: '10px', marginTop: '4px', color: 'green' }}>
                                        {lunch.lunch_name}
                                    </div>
                                ) : null;
                            }
                        }}
                    />
                </div>
            </div>
        </div>
    );
}