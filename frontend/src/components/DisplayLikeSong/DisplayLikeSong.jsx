import { useEffect, useRef, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import config from '@/configs';
import { assets } from '@/assets/assets';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useDispatch, useSelector } from 'react-redux';
import { FaPlay } from 'react-icons/fa6';
import { IoMdMore, IoMdPause } from 'react-icons/io';
import {
    faArrowUpFromBracket,
    faBars,
    faCheck,
    faCirclePlus,
    faCircleXmark,
    faEllipsis,
    faFolder,
    faList,
} from '@fortawesome/free-solid-svg-icons';
import Tippy from '@tippyjs/react';
import TippyHeadless from '@tippyjs/react/headless';
import { getFavoriteSongs, getAllPlaylist, removeLikeSong, addSongToPlaylist } from '@/service/apiService';
import { setCurrentPlaylist, playWithId, setPlayStatus } from '@/redux/Reducer/playerSlice';
import Footer from '@/layouts/components/Footer';
import { useTranslation } from 'react-i18next';

function DisplayLikeSong() {
    const dispatch = useDispatch();
    const { track, playStatus } = useSelector((state) => state.player);

    const [songLikesData, setSongLikesData] = useState([]);
    const [playlists, setPlaylists] = useState([]);
    const [target, setTarget] = useState(false);
    const [hovering, setHovering] = useState(false);
    const [shortType, setShortType] = useState(false);
    const [hoveredSongId, setHoveredSongId] = useState(null);
    const [menuSongId, setMenuSongId] = useState(null);
    const displaySongLikeRef = useRef();
    const location = useLocation();
    const { t } = useTranslation();
    const isSongLike = location.pathname.includes('likedSongs');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSongs = async () => {
            const songs = await getFavoriteSongs();
            if (songs) setSongLikesData(songs.data);
        };
        const fetchPlaylists = async () => {
            const playlistData = await getAllPlaylist();
            if (playlistData) setPlaylists(playlistData.data);
        };
        fetchSongs();
        fetchPlaylists();
    }, []);
    console.log(playlists);

    const handlePlayPlaylist = () => {
        if (songLikesData.length > 0) {
            dispatch(setCurrentPlaylist(songLikesData));
            dispatch(setPlayStatus(true));
        }
    };

    const handlePlaySong = (songId) => {
        dispatch(playWithId(songId));
    };

    const handlePause = () => {
        dispatch(setPlayStatus(false));
    };

    const handleRemoveLikeSong = async (songId) => {
        try {
            await removeLikeSong(songId);
            setSongLikesData(songLikesData.filter((song) => song.id !== songId));
        } catch (error) {
            console.error('Failed to remove song from favorites:', error);
        }
    };

    const handleAddToPlaylist = async (songId, playlistId) => {
        try {
            await addSongToPlaylist({ ma_playlist: playlistId, ma_bai_hat: songId });
            console.log('Added song to playlist!');
        } catch (error) {
            console.error('Failed to add song to playlist:', error);
        }
    };
    // const bgColor = songLikesData;
    const bgColor = '#21115f';

    useEffect(() => {
        if (isSongLike && displaySongLikeRef.current) {
            displaySongLikeRef.current.style.background = `linear-gradient(${bgColor}, #121212)`;
        } else if (displaySongLikeRef.current) {
            displaySongLikeRef.current.style.background = `#121212`;
        }
    }, [isSongLike, bgColor]);

    useEffect(() => {
        if (songLikesData) {
            document.title = `Bài Hát yêu thích | Spotify`;
        }
    });

    return isSongLike ? (
        <div
            ref={displaySongLikeRef}
            className={`bg-[#121212] w-[79%] h-[97.4%] rounded-xl my-2 mr-2 py-4 ${
                target ? 'overflow-hidden' : 'overflow-y-auto'
            }`}
        >
            {/* Header và các nút như cũ */}
            <div className="px-6 mt-4 mb-9 flex flex-col md:flex-row md:items-end gap-8">
                <img className="w-48 rounded" src={assets.liked_songs} alt="" />
                <div>
                    <p className="text-white mb-2">{t('likeSong.playlist')}</p>
                    <h2 className="text-white text-5xl font-extrabold mb-4 md:text-6xl tracking-tight">
                        {t('likeSong.title')}
                    </h2>
                    <h4 className="text-[#b3b3b3] font-medium">{songLikesData.desc}</h4>
                    <p className="text-[#b3b3b3] mt-1 font-medium text-[14px]">
                        <img className="inline-block w-5" src={assets.spotify_logo} alt="" />
                        <b className="text-white text-[14px]"> Spotify </b>• {songLikesData.length} bài hát , khoảng 3
                        giờ 30 phút
                    </p>
                </div>
            </div>

            {songLikesData.length > 0 ? (
                <>
                    {' '}
                    <div className="flex justify-between items-center px-6">
                        <div className="flex gap-8">
                            <button
                                className="flex justify-center items-center w-14 h-14 bg-[#1ed760] rounded-[50%] hover:bg-[#3be477] hover:scale-105"
                                onClick={playStatus ? handlePause : handlePlayPlaylist}
                            >
                                {playStatus && songLikesData.some((song) => song.id === track?.id) ? (
                                    <IoMdPause size={20} />
                                ) : (
                                    <FaPlay size={20} />
                                )}
                            </button>
                            <Tippy content="Lưu vào thư viện">
                                <button className="text-[#b3b3b3] hover:text-white hover:scale-105">
                                    <FontAwesomeIcon icon={faCirclePlus} className="w-8 h-8" />
                                </button>
                            </Tippy>
                            <TippyHeadless
                                interactive
                                visible={hovering || target}
                                placement="bottom-start"
                                render={(attrs) => (
                                    <div
                                        className="text-white text-[14px] font-semibold bg-[#282828] px-1 py-1 pb-2 mr-1 rounded-md shadow-xl"
                                        tabIndex="-1"
                                        {...attrs}
                                    >
                                        {target ? (
                                            <div className="min-w-[296px] h-[130px]">
                                                <button className="flex items-center gap-4 w-full text-[#b3b3b3] py-3 pl-3 pr-2 rounded-[4px] cursor-pointer hover:text-white hover:bg-[#ffffff1a]">
                                                    <FontAwesomeIcon icon={faCirclePlus} />
                                                    <span>{t('likeSong.addToLibrary')}</span>
                                                </button>
                                                <button className="flex items-center gap-4 w-full text-[#b3b3b3] py-3 pl-3 pr-2 rounded-[4px] cursor-pointer hover:text-white hover:bg-[#ffffff1a]">
                                                    <FontAwesomeIcon icon={faCircleXmark} />
                                                    <span>{t('likeSong.removeFromLibrary')}</span>
                                                </button>
                                                <button className="flex items-center gap-4 w-full text-[#b3b3b3] py-3 pl-3 pr-2 rounded-[4px] cursor-pointer hover:text-white hover:bg-[#ffffff1a]">
                                                    <FontAwesomeIcon icon={faFolder} />
                                                    <span>{t('likeSong.addToFolder')}</span>
                                                </button>
                                            </div>
                                        ) : (
                                            <span>{t('likeSong.otherOptions')}</span>
                                        )}
                                    </div>
                                )}
                            >
                                <button
                                    onMouseEnter={() => setHovering(true)}
                                    onMouseLeave={() => setHovering(false)}
                                    onClick={() => {
                                        setTarget(!target);
                                        setHovering(false);
                                    }}
                                >
                                    <FontAwesomeIcon icon={faEllipsis} className="w-6 h-6 text-[#b3b3b3]" />
                                </button>
                            </TippyHeadless>
                        </div>
                        <div>
                            <TippyHeadless
                                interactive
                                placement="bottom-end"
                                trigger="click"
                                render={(attrs) => (
                                    <div
                                        className="bg-[#282828] w-40 h-32 p-1 rounded shadow-[0_16px_24px_0_rgba(0,0,0,0.3)]"
                                        tabIndex="-1"
                                        {...attrs}
                                    >
                                        <ul>
                                            <li>
                                                <span className="p-3 text-[#b3b3b3] text-[11px] font-bold">
                                                    {t('likeSong.viewAs')}
                                                </span>
                                            </li>
                                            <li>
                                                <button
                                                    className="w-full text-white text-left p-3 pr-2 hover:bg-[#3e3e3e]"
                                                    onClick={() => setShortType(true)}
                                                >
                                                    {shortType ? (
                                                        <>
                                                            <FontAwesomeIcon
                                                                icon={faBars}
                                                                className="mr-3 text-[#1fcc5d]"
                                                            />
                                                            <span className="text-[14px] text-[#1fcc5d]">
                                                                {t('likeSong.shorten')}
                                                            </span>
                                                            <FontAwesomeIcon
                                                                icon={faCheck}
                                                                className="ml-10 text-[#1fcc5d]"
                                                            />
                                                        </>
                                                    ) : (
                                                        <>
                                                            <FontAwesomeIcon icon={faBars} className="mr-3" />
                                                            <span className="text-[14px]">{t('likeSong.shorten')}</span>
                                                        </>
                                                    )}
                                                </button>
                                            </li>
                                            <li>
                                                <button
                                                    className="w-full text-white text-left p-3 pr-2 hover:bg-[#3e3e3e]"
                                                    onClick={() => setShortType(false)}
                                                >
                                                    {shortType ? (
                                                        <>
                                                            <FontAwesomeIcon icon={faList} className="mr-3" />
                                                            <span className="text-[14px]">{t('likeSong.list')}</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <FontAwesomeIcon
                                                                icon={faList}
                                                                className="mr-3 text-[#1fcc5d]"
                                                            />
                                                            <span className="text-[14px] text-[#1fcc5d]">
                                                                {t('likeSong.list')}
                                                            </span>
                                                            <FontAwesomeIcon
                                                                icon={faCheck}
                                                                className="ml-5 text-[#1fcc5d]"
                                                            />
                                                        </>
                                                    )}
                                                </button>
                                            </li>
                                        </ul>
                                    </div>
                                )}
                            >
                                <div className="flex justify-center items-center gap-3 text-[#b3b3b3] text-[14px] hover:text-white cursor-pointer">
                                    <p>{t('likeSong.list')}</p>
                                    <FontAwesomeIcon icon={faList} />
                                </div>
                            </TippyHeadless>
                        </div>
                    </div>
                    {/* Tiêu đề cột */}
                    {shortType ? (
                        <div className="grid grid-cols-2 sm:grid-cols-[1.5fr_1fr_1fr_0.3fr_0.2fr] px-6 mt-10 mb-4 text-[#a7a7a7]">
                            <p className="font-semibold">
                                <b className="mr-4">#</b>
                                {t('likeSong.title')}
                            </p>
                            <p className="font-semibold">{t('likeSong.artist')}</p>
                            <p className="font-semibold">{t('likeSong.album')}</p>
                            <img className="m-auto w-4" src={assets.clock_icon} alt="" />
                            <span></span> {/* Cột cho biểu tượng ba chấm */}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-[1.7fr_1fr_0.3fr_0.2fr] px-6 mt-10 mb-4 text-[#a7a7a7]">
                            <p className="font-semibold">
                                <b className="mr-4">#</b>
                                {t('likeSong.title')}
                            </p>
                            <p className="font-semibold">{t('likeSong.album')}</p>
                            <img className="m-auto w-4" src={assets.clock_icon} alt="" />
                            <span></span> {/* Cột cho biểu tượng ba chấm */}
                        </div>
                    )}
                    <hr className="mt-[-8px] mb-4 mx-6" />
                    {/* Danh sách bài hát */}
                    {songLikesData.map((item, index) =>
                        shortType ? (
                            <div
                                key={index}
                                onClick={() => navigate(config.routes.detailSong + `/${item.id}`)}
                                onMouseEnter={() => setHoveredSongId(item.id)}
                                onMouseLeave={() => setHoveredSongId(null)}
                                className="grid grid-cols-2 sm:grid-cols-[1.5fr_1fr_1fr_0.3fr_0.2fr] gap-2 p-2 px-6 items-center text-[#a7a7a7] hover:bg-[#ffffff2b] cursor-pointer"
                            >
                                <div className="flex items-center">
                                    <div
                                        className="mr-4 w-5 h-5 flex items-center justify-center"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (playStatus && track?.id === item.id) {
                                                handlePause();
                                            } else {
                                                handlePlaySong(item.id);
                                            }
                                        }}
                                    >
                                        {hoveredSongId === item.id ? (
                                            playStatus && track?.id === item.id ? (
                                                <IoMdPause size={16} className="text-white" />
                                            ) : (
                                                <FaPlay size={14} className="text-white" />
                                            )
                                        ) : (
                                            <b>{index + 1}</b>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-white font-semibold">{item.ten_bai_hat}</p>
                                    </div>
                                </div>
                                <div className="text-[15px] font-semibold">
                                    <p>{item.ma_user?.name}</p>
                                </div>
                                <div className="text-[15px] font-semibold">
                                    <p>{item.albums}</p>
                                </div>
                                <div className="text-center">
                                    <p>3:13</p>
                                </div>
                                <div className="text-center">
                                    {hoveredSongId === item.id && (
                                        <TippyHeadless
                                            interactive
                                            visible={menuSongId === item.id}
                                            placement="bottom-end"
                                            appendTo={() => document.body}
                                            render={(attrs) => (
                                                <div
                                                    className="bg-[#282828] text-white text-[14px] font-semibold px-1 py-2 rounded-md shadow-xl"
                                                    tabIndex="-1"
                                                    {...attrs}
                                                >
                                                    <button
                                                        className="flex items-center gap-2 w-full text-left py-2 px-3 hover:bg-[#ffffff1a]"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleRemoveLikeSong(item.id);
                                                            setMenuSongId(null);
                                                        }}
                                                    >
                                                        <FontAwesomeIcon icon={faCircleXmark} />
                                                        <span>{t('likeSong.removeFromLibrary')}</span>
                                                    </button>
                                                    <TippyHeadless
                                                        interactive
                                                        placement="left"
                                                        appendTo={() => document.body}
                                                        render={(subAttrs) => (
                                                            <div
                                                                className="bg-[#282828] text-white text-[14px] font-semibold px-1 py-2 rounded-md shadow-xl min-w-[200px]"
                                                                tabIndex="-1"
                                                                {...subAttrs}
                                                            >
                                                                {playlists.map((playlist) => (
                                                                    <button
                                                                        key={playlist.ma_playlist}
                                                                        className="flex items-center gap-2 w-full text-left py-2 px-3 hover:bg-[#ffffff1a]"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleAddToPlaylist(
                                                                                item.id,
                                                                                playlist.ma_playlist,
                                                                            );
                                                                            setMenuSongId(null);
                                                                        }}
                                                                    >
                                                                        <span>{playlist.ten_playlist}</span>
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        )}
                                                    >
                                                        <button className="flex items-center gap-2 w-full text-left py-2 px-3 hover:bg-[#ffffff1a]">
                                                            <FontAwesomeIcon icon={faFolder} />
                                                            <span>{t('likeSong.addToPlaylist')}</span>
                                                        </button>
                                                    </TippyHeadless>
                                                </div>
                                            )}
                                        >
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setMenuSongId(menuSongId === item.id ? null : item.id);
                                                }}
                                            >
                                                <IoMdMore size={20} className="text-white" />
                                            </button>
                                        </TippyHeadless>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div
                                key={index}
                                onClick={() => navigate(config.routes.detailSong + `/${item.id}`)}
                                onMouseEnter={() => setHoveredSongId(item.id)}
                                onMouseLeave={() => setHoveredSongId(null)}
                                className="grid grid-cols-2 sm:grid-cols-[1.7fr_1fr_0.3fr_0.2fr] gap-2 p-2 px-6 items-center text-[#a7a7a7] hover:bg-[#ffffff2b] cursor-pointer"
                            >
                                <div className="flex items-center">
                                    <div
                                        className="mr-4 w-5 h-5 flex items-center justify-center"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (playStatus && track?.id === item.id) {
                                                handlePause();
                                            } else {
                                                handlePlaySong(item.id);
                                            }
                                        }}
                                    >
                                        {hoveredSongId === item.id ? (
                                            playStatus && track?.id === item.id ? (
                                                <IoMdPause size={16} className="text-white" />
                                            ) : (
                                                <FaPlay size={14} className="text-white" />
                                            )
                                        ) : (
                                            <b>{index + 1}</b>
                                        )}
                                    </div>
                                    <img className="inline w-10 mr-5" src={item.hinh_anh} alt="" />
                                    <div>
                                        <p className="text-white font-semibold">{item.ten_bai_hat}</p>
                                        <p className="text-[14px] font-semibold">{item.ma_user?.name}</p>
                                    </div>
                                </div>
                                <div className="text-[15px] font-semibold">
                                    <p>{item.albums}</p>
                                </div>
                                <div className="text-center">
                                    <p>4:12</p>
                                </div>
                                <div className="text-center">
                                    {hoveredSongId === item.id && (
                                        <TippyHeadless
                                            interactive
                                            visible={menuSongId === item.id}
                                            placement="bottom-end"
                                            appendTo={() => document.body}
                                            render={(attrs) => (
                                                <div
                                                    className="bg-[#282828] text-white text-[14px] font-semibold px-1 py-2 rounded-md shadow-xl"
                                                    tabIndex="-1"
                                                    {...attrs}
                                                >
                                                    <button
                                                        className="flex items-center gap-2 w-full text-left py-2 px-3 hover:bg-[#ffffff1a]"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleRemoveLikeSong(item.id);
                                                            setMenuSongId(null);
                                                        }}
                                                    >
                                                        <FontAwesomeIcon icon={faCircleXmark} />
                                                        <span>{t('likeSong.removeFromLibrary')}</span>
                                                    </button>
                                                    <TippyHeadless
                                                        interactive
                                                        placement="left"
                                                        appendTo={() => document.body}
                                                        render={(subAttrs) => (
                                                            <div
                                                                className="bg-[#282828] text-white text-[14px] font-semibold px-1 py-2 rounded-md shadow-xl min-w-[200px]"
                                                                tabIndex="-1"
                                                                {...subAttrs}
                                                            >
                                                                {playlists.map((playlist) => (
                                                                    <button
                                                                        key={playlist.ma_playlist}
                                                                        className="flex items-center gap-2 w-full text-left py-2 px-3 hover:bg-[#ffffff1a]"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleAddToPlaylist(
                                                                                item.id,
                                                                                playlist.ma_playlist,
                                                                            );
                                                                            setMenuSongId(null);
                                                                        }}
                                                                    >
                                                                        <span>{playlist.ten_playlist}</span>
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        )}
                                                    >
                                                        <button className="flex items-center gap-2 w-full text-left py-2 px-3 hover:bg-[#ffffff1a]">
                                                            <FontAwesomeIcon icon={faFolder} />
                                                            <span>{t('likeSong.addToPlaylist')}</span>
                                                        </button>
                                                    </TippyHeadless>
                                                </div>
                                            )}
                                        >
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setMenuSongId(menuSongId === item.id ? null : item.id);
                                                }}
                                            >
                                                <IoMdMore size={20} className="text-white" />
                                            </button>
                                        </TippyHeadless>
                                    )}
                                </div>
                            </div>
                        ),
                    )}
                </>
            ) : (
                <div className="flex justify-center items-center h-[200px]">
                    <p className="text-white text-sm font-semibold">{t('likeSong.noSongsInLibrary')}</p>
                </div>
            )}

            <Footer />
        </div>
    ) : null;
}

export default DisplayLikeSong;
