import actionTypes from '../constants/actionTypes';
import runtimeEnv from '@mars/heroku-js-runtime-env';

function moviesFetched(movies){
    return {
        type: actionTypes.FETCH_MOVIES,
        movies: movies
    }
}

function movieFetched(movie){
    return {
        type: actionTypes.FETCH_MOVIE,
        selectedMovie: movie
    }
}

function movieSet(movie){
    return {
        type: actionTypes.SET_MOVIE,
        selectedMovie: movie
    }
}

function movieResults(movies) {
    return {
        type: actionTypes.SEARCH_MOVIES,
        searchResults: movies
    }
}

export function setMovie(movie) {
    return dispatch => {
        dispatch(movieSet(movie));
    }
}



export function fetchMovies(){
    const env = runtimeEnv();
    return dispatch => {
        return fetch(`${env.REACT_APP_API_URL}/movies/?reviews=true`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': localStorage.getItem('token')
            },
            mode: 'cors'})
            .then( (response) => {
                if (!response.status) {
                    throw Error(response.statusText);
                }
                return response.json();
            })
            .then( (res) => {
                dispatch(moviesFetched(res.result));
            })
            .catch( (e) => console.log(e) );
    }
}

export function fetchMovie(movieId){
    const env = runtimeEnv();
    return dispatch => {
        return fetch(`${env.REACT_APP_API_URL}/movies/${movieId}?reviews=true`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': localStorage.getItem('token')
            },
            mode: 'cors'})
            .then( (response) => {
                if (!response.ok) {
                    throw Error(response.statusText);
                }
                return response.json();
            })
            .then( (res) => {
                let movie = res.result[0];
                dispatch(movieFetched(movie));
            })
            .catch( (e) => console.log(e) );
    }
}

export function searchMovies(movies, searchString) {

    return dispatch => {
        let ss = searchString.toUpperCase();
        let results = [];
        movies.forEach((movie) => {
            let m = false;
            if (movie.title.toUpperCase().includes(ss) ||
                movie.year.toUpperCase().includes(ss) ||
                movie.genre.toUpperCase().includes(ss))
                m = true;
            for (let i = 0; i < movie.actors.length; i++) {
                if (movie.actors[i].actorname.toUpperCase().includes(ss) ||
                    movie.actors[i].charactername.toUpperCase().includes(ss))
                    m = true;
            }
            if (m === true)
                results.push(movie);
        });
        dispatch(movieResults(results));
    }
}