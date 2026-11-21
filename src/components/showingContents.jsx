import React, { useEffect, useState } from 'react';
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
        return movie.getFormattedDate();
    }

    return 'Showing Today';
}

function getEarliestScheduleForMovie(movie, customShowtimes, cinemaList) {
    const movieIdStr = String(movie?.movieId ?? '').trim();
    const candidateTimes = [];

    // 1. Custom admin showtimes for this movie
    (Array.isArray(customShowtimes) ? customShowtimes : []).forEach((item) => {
        if (String(item?.movieId ?? '').trim() === movieIdStr && item?.schedule) {
            candidateTimes.push(item.schedule);
        }
    });

    // 2. Default showtimes from movie.showSchedule or cinema model schedules
    if (Array.isArray(movie?.showSchedule)) {
        candidateTimes.push(...movie.showSchedule);
    }

    const activeCinemas = Array.isArray(cinemaList) && cinemaList.length > 0 ? cinemaList : cinemas;
    activeCinemas.forEach((cinema) => {
        const cinemaIdStr = String(cinema?.cinemaId ?? '').trim();
        if (!cinemaIdStr || !movieIdStr) return;
        const scheduleObj = getShowtime(movieIdStr, cinemaIdStr, movie?.showSchedule);
        if (Array.isArray(scheduleObj?.schedules)) {
            candidateTimes.push(...scheduleObj.schedules);
        }
    });

    // Sort chronologically so the very first screening comes first
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
}

export default function ShowingContent({ onMoviePress, currentUser, movies = [] }) {
    const { width } = useWindowDimensions();
    const center_first_and_last_movies = width * -0.14;

    const [customShowtimes, setCustomShowtimes] = useState([]);
    const [cinemaList, setCinemaList] = useState(cinemas);

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
    }, [movies]);

    return (
        <View style={ShowingScreenStyles.mainContainer}>
            <Text style={ShowingScreenStyles.welcomeMessage}>
                {currentUser
                    ? `Welcome to SB Cinema ${currentUser.name}!`
                    : 'Welcome to SB Cinema, Guest!'}
            </Text>

            <ScrollView
                horizontal={true}
                pagingEnabled={true}
                decelerationRate="fast"
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={ShowingScreenStyles.scrollView}
            >
                {movies.map((movie, index) => {
                    const isFirst = index === 0;
                    const isLast = index === movies.length - 1;

                    let extraStyle = {};
                    if (isFirst) extraStyle = { marginLeft: center_first_and_last_movies };
                    if (isLast) extraStyle = { marginRight: center_first_and_last_movies };

                    // Bulletproof image source resolution for API mock structures
                    const rawPoster = movie.poster || movie.poster_url || movie.image || '';
                    const resolvedPosterSource =
                        typeof rawPoster === 'object' && rawPoster !== null && rawPoster.uri
                            ? { uri: rawPoster.uri }
                            : typeof rawPoster === 'string' && rawPoster.trim().length > 0
                                ? { uri: rawPoster.trim() }
                                : require('../../assets/dummy-img.png');

                    const firstSchedule = getEarliestScheduleForMovie(
                        movie,
                        customShowtimes,
                        cinemaList
                    );
                    const formattedStartingTime = formatFirstSchedule(firstSchedule, movie);

                    return (
                        <View
                            key={movie.movieId || index}
                            style={[ShowingScreenStyles.showingScreenContainer, { width }]}
                        >
                            <View style={ShowingScreenStyles.imageTouchableWrapper}>
                                <TouchableOpacity
                                    style={ShowingScreenStyles.imageTouchable}
                                    onPress={() => onMoviePress(movie)}
                                >
                                    <Image
                                        source={resolvedPosterSource}
                                        style={[
                                            isFirst || isLast
                                                ? ShowingScreenStyles.imageEdge
                                                : ShowingScreenStyles.imageMiddle,
                                            { width: width, resizeMode: 'contain' },
                                            extraStyle
                                        ]}
                                        onError={(e) => console.log('Image loading error:', e.nativeEvent.error)}
                                    />
                                </TouchableOpacity>
                            </View>

                            {/* Aligned details container matching the poster box width */}
                            <View style={{ width: '100%', alignItems: 'center', marginTop: 12, paddingHorizontal: 10 }}>
                                <Text style={{ color: "#fff", fontWeight: 'bold', fontSize: 16, textAlign: 'center', marginBottom: 4 }}>
                                    {movie.title}
                                </Text>
                                <Text style={{ color: "#aaa", fontSize: 14, marginBottom: 2 }}>
                                    Starting price: ₱{movie.ticketPrice}
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