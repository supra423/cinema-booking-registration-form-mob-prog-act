import React from 'react';
import { 
  Text, 
  View, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  useWindowDimensions 
} from 'react-native';
// Relative path from scr/components/ to scr/models/
import { movies } from '../models/movie';
import { ShowingScreenStyles } from '../Styles';

export default function ShowingContent({ onMoviePress, currentUser }) {
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
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={ShowingScreenStyles.scrollView}
            >
                {movies.map((movie, index) => {
                    const isFirst = index === 0;
                    const isLast = index === movies.length - 1;

                    let extraStyle = {};
                    if (isFirst) extraStyle = { marginLeft: center_first_and_last_movies };
                    if (isLast) extraStyle = { marginRight: center_first_and_last_movies };

                    return (
                        <View
                            key={movie.movieId || index}
                            style={[ShowingScreenStyles.showingScreenContainer, extraStyle]}
                        >
                            <View style={ShowingScreenStyles.imageTouchableWrapper}>
                                <TouchableOpacity
                                    style={ShowingScreenStyles.imageTouchable}
                                    onPress={() => onMoviePress(movie)}
                                >
                                    <Image
                                        source={require('../../assets/dummy-img.png')}
                                        style={
                                            isFirst || isLast
                                                ? ShowingScreenStyles.imageEdge
                                                : ShowingScreenStyles.imageMiddle
                                        }
                                    />
                                </TouchableOpacity>
                            </View>
                            <Text style={{color: "#fff"}}>Title: {movie.title}</Text>
                            <Text style={{color: "#fff"}}>Price per ticket: {movie.ticketPrice}</Text>
                            <Text style={{color: "#fff"}}>Showing: {movie.getFormattedDate()}</Text>
                        </View>
                    );
                })}
            </ScrollView>
        </View>
    );
}