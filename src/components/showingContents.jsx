import React from 'react';
import {
    Text,
    View,
    ScrollView,
    Image,
    TouchableOpacity,
    useWindowDimensions
} from 'react-native';
import { ShowingScreenStyles } from '../Styles';

export default function ShowingContent({ onMoviePress, currentUser, movies = [] }) {
    const { width } = useWindowDimensions();
    const center_first_and_last_movies = width * -0.14;

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

                    // Safe fallback date formatter if model method is missing
                    const formattedDate = typeof movie.getFormattedDate === 'function'
                        ? movie.getFormattedDate()
                        : 'Showing Today';

                    return (
                        <View
                            key={movie.movieId || index}
                            style={[ShowingScreenStyles.showingScreenContainer, {width}]}
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
                                            { width: width, resizeMode: 'contain' }
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
                                    Showing: {formattedDate}
                                </Text>
                            </View>
                        </View>
                    );
                })}
            </ScrollView>
        </View>
    );
}