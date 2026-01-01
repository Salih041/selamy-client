import React, { useState, useEffect } from 'react'
import api from '../api';
import { useSearchParams } from 'react-router-dom';
import Post from '../components/Post';
import "../styles/home.css"
import PostSkeleton from '../components/skeletons/PostSkeleton';
import { useAuth } from "../context/AuthContext";
import ReleaseNotes from '../components/ReleaseNotesModal';
import { FaFireFlameCurved } from "react-icons/fa6";


function Home() {

    const [posts, setPosts] = useState([]);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, limit: 20, totalResults: 0 })
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null)
    const [activeTab, setActiveTab] = useState("all");
    const { isLoggedIn } = useAuth();

    const [searchParams, setSearchParams] = useSearchParams();
    const searchTerm = searchParams.get("search");
    const searchTag = searchParams.get("tag");

    const [popularTags, setPopularTags] = useState([]);
    const [displayPopularTags, setDisplayPopularTags] = useState(false);

    const handlePopularTags = async () => {
        try {
            if (!displayPopularTags) {
                const response = await api.get("/posts/popular-tags");
                setPopularTags(response.data);
            }
            setDisplayPopularTags(!displayPopularTags);
        } catch (error) {
            console.error(error.message);
        }
    }

    const fetchPosts = async () => {
        try {
            setIsLoading(true);
            setError(null);

            let url;

            if (searchTerm) {
                url = `/posts/search?q=${searchTerm}&page=${page}&limit=20`
            }
            else if (searchTag) {
                url = `/posts/search?tag=${searchTag}&page=${page}&limit=20`
            }
            else {
                if (activeTab === "all") url = `/posts?page=${page}&limit=20`;
                else url = `/posts/feed?page=${page}&limit=20`;
            }

            const response = await api.get(url);
            setPosts(response.data.data);
            setPagination(response.data.pagination)
        } catch (error) {
            console.log("error : ", error);
            setError(error.response ? error.response.data.message : error.message);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchPosts();
    }, [page, searchTerm, searchTag, activeTab]);

    useEffect(() => {
        setPage(1);
    }, [searchTerm, searchTag, activeTab]);

    const clearSearch = () => {
        setSearchParams({}); // url parametre temizleme
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages && newPage !== page) {
            setIsLoading(true);
            //fetchPosts(newPage);
            setPage(newPage);
        }
    };

    const handleTabChange = (tab) => {
        if (activeTab !== tab) {
            setActiveTab(tab);
        }
    }

    if (error) return <p className='error'>Error: {error}</p>;
    return (
        <>
            <ReleaseNotes></ReleaseNotes>
            {(searchTerm || searchTag) && (
                <div style={{ textAlign: 'center', margin: '20px', color: '#666' }}>
                    <h3>"{searchTerm ? searchTerm : searchTag}" results:</h3>
                    <button onClick={clearSearch} className='home_clear-search-button'>Clear Search</button>
                </div>
            )}

            {!searchTerm && !searchTag && (
                <div className="home-tabs">
                    <div className="popular-tags-wrapper">
                        <button className='popular-tags-btn' onClick={handlePopularTags}>
                            <FaFireFlameCurved/> Trending
                        </button>

                        {displayPopularTags && (
                            <div className='popular-tags-dropdown'>
                                {popularTags.length > 0 ? (
                                    <>
                                        <div className="dropdown-title">Popular Tags</div>
                                        <div className="tags-grid">
                                            {popularTags.map((tag, index) => (
                                                <span
                                                    key={tag._id || index}
                                                    className='popular-tags-tag'
                                                    onClick={() => { setSearchParams("tag=" + tag._id);setDisplayPopularTags(false) }}
                                                >
                                                    #{tag._id}
                                                    <span className="tag-count">{tag.count}</span>
                                                </span>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <div className="empty-state">Tags not found</div>
                                )}
                            </div>
                        )}
                    </div>
                    {
                        isLoggedIn && (<div>
                            <button
                                className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
                                onClick={() => handleTabChange('all')}
                            >
                                All
                            </button>
                            <button
                                className={`tab-btn ${activeTab === 'feed' ? 'active' : ''}`}
                                onClick={() => handleTabChange('feed')}
                            >
                                Following
                            </button>
                        </div>)
                    }

                </div>
            )}

            {isLoading ?
                (
                    <div className='posts-container'>
                        <PostSkeleton cards={6} />
                    </div>
                ) : ""
            }

            <div className='posts-container'>
                {
                    posts.length > 0 ?
                        (
                            posts.map((post) => (
                                <Post key={post._id} postProps={post}></Post>
                            ))) :
                        (
                            (
                                <p style={{ textAlign: 'center', width: '100%' }}>{searchTerm ? "No Result" : "No Post"}</p>
                            )
                        )

                }
            </div>
            <div className='home__controls'>
                <button onClick={() => { handlePageChange(page - 1) }} disabled={page === 1}>prev</button>
                <span>Page {page} / {pagination.totalPages}</span>
                <button onClick={() => { handlePageChange(page + 1) }} disabled={page === pagination.totalPages}>next</button>
            </div>
        </>
    )
}

export default Home
