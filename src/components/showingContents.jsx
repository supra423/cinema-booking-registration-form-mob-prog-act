import React, { useEffect, useMemo, useState } from 'react';
import {
    Text,
    View,
    ScrollView,
    Image,
    TouchableOpacity,
    useWindowDimensions
} from 'react-native';
import { ShowingScreenStyles } from '../Styles';
import { cinemas, loadCinemas } from '../models/cinema';
import { getShowtime } from '../models/showtimes';
import { loadShowtimes } from '../services/showtimeStorage';

const MAX_CAROUSEL_MOVIES = 6;

function isBareImageBaseUrl(url) {
    if (!url || typeof url !== 'string') return true;
    const normalized = url.trim().replace(/\/+$/, '');
    return (
        normalized === 'https://image.tmdb.org/t/p/original' ||
        normalized === 'https://image.tmdb.org/t/p/w500' ||
        normalized === 'https://image.tmdb.org/t/p/w342' ||
        normalized === 'https://image.tmdb.org/t/p/w185' ||
        normalized === 'https://image.tmdb.org/t/p/w780'
    );
}

function formatFirstSchedule(scheduleValue, movie) {
    if (scheduleValue) {
        const parsed = new Date(scheduleValue);
        if (!Number.isNaN(parsed.getTime())) {
            return parsed.toLocaleString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
            });
        }
        return String(scheduleValue);
    }

    if (typeof movie?.getFormattedDate === 'function') {
        try {
            return String(movie.getFormattedDate());
        } catch {
            return 'Showing Today';
        }
    }

    return 'Showing Today';
}

function getEarliestScheduleForMovie(movie, customShowtimes, cinemaList) {
    try {
        const movieIdStr = String(movie?.movieId ?? '').trim();
        const candidateTimes = [];

        (Array.isArray(customShowtimes) ? customShowtimes : []).forEach((item) => {
            if (String(item?.movieId ?? '').trim() === movieIdStr && item?.schedule) {
                candidateTimes.push(item.schedule);
            }
        });

        if (Array.isArray(movie?.showSchedule)) {
            candidateTimes.push(...movie.showSchedule);
        }

        const activeCinemas = Array.isArray(cinemaList) && cinemaList.length > 0 ? cinemaList : cinemas;
        (Array.isArray(activeCinemas) ? activeCinemas : []).forEach((cinema) => {
            const cinemaIdStr = String(cinema?.cinemaId ?? '').trim();
            if (!cinemaIdStr || !movieIdStr) return;
            const scheduleObj = getShowtime(movieIdStr, cinemaIdStr, movie?.showSchedule);
            if (Array.isArray(scheduleObj?.schedules)) {
                candidateTimes.push(...scheduleObj.schedules);
            }
        });

        const validTimestamps = candidateTimes
            .map((val) => ({ raw: val, ms: new Date(val).getTime() }))
            .filter((entry) => !Number.isNaN(entry.ms))
            .sort((a, b) => a.ms - b.ms);

        if (validTimestamps.length > 0) {
            return validTimestamps[0].raw;
        }

        const firstNonEmptyString = candidateTimes.find(
            (val) => typeof val === 'string' && val.trim().length > 0
        );
        return firstNonEmptyString || null;
    } catch {
        return null;
    }
}

export default function ShowingContent({ onMoviePress, currentUser, movies = [] }) {
    const { width } = useWindowDimensions();
    const center_first_and_last_movies = width * -0.14;

    const [customShowtimes, setCustomShowtimes] = useState([]);
    const [cinemaList, setCinemaList] = useState(Array.isArray(cinemas) ? cinemas : []);

    useEffect(() => {
        let active = true;
        Promise.all([loadShowtimes(), loadCinemas()])
            .then(([storedShowtimes, storedCinemas]) => {
                if (!active) return;
                setCustomShowtimes(Array.isArray(storedShowtimes) ? storedShowtimes : []);
                if (Array.isArray(storedCinemas) && storedCinemas.length > 0) {
                    setCinemaList(storedCinemas);
                }
            })
            .catch((err) => {
                console.error('Error loading schedules for showing content:', err);
            });

        return () => {
            active = false;
        };
    }, []);

    const safeMovies = Array.isArray(movies) ? movies : [];
    const displayedMovies = useMemo(
        () => safeMovies.slice(0, MAX_CAROUSEL_MOVIES),
        [safeMovies]
    );

    const safeUserName =
        typeof currentUser?.name === 'string' && currentUser.name.trim().length > 0
            ? currentUser.name
            : 'Guest';

    const schedulesByMovieKey = useMemo(() => {
        const map = new Map();
        displayedMovies.forEach((movie, index) => {
            const key = String(movie?.movieId ?? index);
            const rawSchedule = getEarliestScheduleForMovie(movie, customShowtimes, cinemaList);
            map.set(key, formatFirstSchedule(rawSchedule, movie));
        });
        return map;
    }, [displayedMovies, customShowtimes, cinemaList]);

    return (
        <View style={ShowingScreenStyles.mainContainer}>
            <Text style={ShowingScreenStyles.welcomeMessage}>
                {currentUser
                    ? `Welcome to SB Cinema ${safeUserName}!`
                    : 'Welcome to SB Cinema, Guest!'}
            </Text>

            <ScrollView
                horizontal={true}
                pagingEnabled={true}
                decelerationRate="fast"
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={ShowingScreenStyles.scrollView}
            >
                {displayedMovies.map((movie, index) => {
                    const isFirst = index === 0;
                    const isLast = index === displayedMovies.length - 1;

                    let extraStyle = {};
                    if (isFirst) extraStyle = { marginLeft: center_first_and_last_movies };
                    if (isLast) extraStyle = { marginRight: center_first_and_last_movies };

                    const rawPoster = movie?.poster || movie?.poster_url || movie?.image || '';
                    const trimmedPoster =
                        typeof rawPoster === 'object' && rawPoster !== null && rawPoster.uri
                            ? String(rawPoster.uri).trim()
                            : typeof rawPoster === 'string'
                                ? rawPoster.trim()
                                : '';

                    const resolvedPosterSource =
                        trimmedPoster.length > 0 && !isBareImageBaseUrl(trimmedPoster)
                            ? { uri: trimmedPoster }
                            : require('../../assets/dummy-img.png');

                    const movieKey = String(movie?.movieId ?? index);
                    const formattedStartingTime =
                        schedulesByMovieKey.get(movieKey) ?? 'Showing Today';
                    const displayTitle =
                        typeof movie?.title === 'string' && movie.title.trim().length > 0
                            ? movie.title
                            : 'Untitled Movie';
                    const displayPrice =
                        movie?.ticketPrice !== undefined && movie?.ticketPrice !== null
                            ? String(movie.ticketPrice)
                            : '—';

                    return (
                        <View
                            key={movie?.movieId ?? index}
                            style={[ShowingScreenStyles.showingScreenContainer, { width }]}
                        >
                            <View style={ShowingScreenStyles.imageTouchableWrapper}>
                                <TouchableOpacity
                                    style={ShowingScreenStyles.imageTouchable}
                                    onPress={() => onMoviePress?.(movie)}
                                >
                                    <Image
                                        source={resolvedPosterSource}
                                        style={[
                                            isFirst || isLast
                                            ? ShowingScreenStyles.imageEdge
                                            : ShowingScreenStyles.imageMiddle,
                                        ]}
                                        onError={(e) => console.log('Image loading error:', e.nativeEvent.error)}
                                        />
                                </TouchableOpacity>
                            </View>

                            <View style={{ width: '100%', alignItems: 'center', marginTop: 12, paddingHorizontal: 10 }}>
                                <Text style={{ color: "#fff", fontWeight: 'bold', fontSize: 16, textAlign: 'center', marginBottom: 4 }}>
                                    {displayTitle}
                                </Text>
                                <Text style={{ color: "#aaa", fontSize: 14, marginBottom: 2 }}>
                                    Starting price: ₱{displayPrice}
                                </Text>
                                <Text style={{ color: "#aaa", fontSize: 14 }}>
                                    Starting Time: {formattedStartingTime}
                                </Text>
                            </View>
                        </View>
                    );
                })}
            </ScrollView>
        </View>
    );
}