'use client';
import './main.css';

import { useState, useRef, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

export default function RecommendationPage() {
    const [keywords, setKeywords] = useState([]);
    const [location, setLocation] = useState('');
    const [result, setResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const [checkedIndex, setCheckedIndex] = useState(null);
    const [value, onChange] = useState(new Date());

    const mapRef = useRef(null);

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
                    <p className="nav_login">로그인/회원가입</p>
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
                    <Calendar onChange={onChange} value={value}></Calendar>
                </div>
            </div>
        </div>
    );
}