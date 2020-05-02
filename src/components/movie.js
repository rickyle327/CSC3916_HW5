import React, { Component }  from 'react';
import {connect} from "react-redux";
import { Glyphicon, Panel, ListGroup, ListGroupItem } from 'react-bootstrap'
import { Image } from 'react-bootstrap'
import { withRouter } from "react-router-dom";
import {fetchMovie} from "../actions/movieActions";
import posterNotFound from "./posterNotFound.jpg";
import { Col, Form, FormGroup, FormControl, Button, ControlLabel } from 'react-bootstrap';
import runtimeEnv from '@mars/heroku-js-runtime-env';

//support routing by creating a new component

class ReviewInput extends Component {

    constructor(props) {
        super(props);
        this.submitReview = this.submitReview.bind(this);
        this.updateDetails = this.updateDetails.bind(this);

        this.state = {
            details: {
                rating: 5,
                quote: ""
            }
        }
    }

    submitReview() {
        const env = runtimeEnv();
        /*let formBody = new FormData();
        formBody.set("movie", this.props.movieId);
        formBody.set("quote", this.state.details.quote);
        formBody.set("rating", this.state.details.rating);*/
        let details = {
            'movie': this.props.movieId,
            'quote': this.state.details.quote,
            'rating': this.state.details.rating
        };
        let formBody = [];
        for (let property in details) {
            let encodedKey = encodeURIComponent(property);
            let encodedValue = encodeURIComponent(details[property]);
            formBody.push(encodedKey + "=" + encodedValue);
        }
        formBody = formBody.join("&");
        let headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': localStorage.getItem('token')
        };
        //console.log("headers: "+JSON.stringify(headers));
        //console.log("body: "+JSON.stringify(formBody));
        return fetch(`${env.REACT_APP_API_URL}/reviews`, {
            method: 'POST',
            headers: headers,
            mode: 'cors',
            body: formBody
        })
            .then((response) => {
                console.log("response: "+JSON.stringify(response));
                console.log("statusText: "+response.statusText);
                //console.log("resheaders: "+JSON.stringify(response.headers));
                if (!response || !response.status) {
                    throw Error(response.statusText);
                }
                return response.json();
            })
            .then((res) => {
                console.log("res: "+JSON.stringify(res));
                window.location.reload();
            })
            .catch((e) => console.log(e));
    }

    updateDetails(event) {
        let updateDetails = Object.assign({}, this.state.details);
        //console.log("details: "+JSON.stringify(this.state.details));
        updateDetails[event.target.id] = event.target.value;
        this.setState({
            details: updateDetails
        });
    }

    render() {
        return (
            <Form horizontal>
                <h3>Write a Review</h3>
                <FormGroup controlId="rating">
                    <Col componentClass={ControlLabel} sm={2}>
                        Rating
                    </Col>
                    <Col sm={10}>
                        <FormControl onChange={this.updateDetails}
                                     componentClass="select"
                                     placeholder="rating"
                                     value={this.state.details.rating}>
                            <option value="5">5 Stars</option>
                            <option value="4">4 Stars</option>
                            <option value="3">3 Stars</option>
                            <option value="2">2 Stars</option>
                            <option value="1">1 Stars</option>
                        </FormControl>
                    </Col>
                </FormGroup>
                <FormGroup controlId="quote">
                    <Col componentClass={ControlLabel} sm={2}>
                        Review
                    </Col>
                    <Col sm={10}>
                        <FormControl onChange={this.updateDetails}
                                     value={this.state.details.quote} componentClass="textarea"
                                     placeholder="Type review here..." />
                    </Col>
                </FormGroup>
                <FormGroup>
                    <Button onClick={this.submitReview}>Submit Review</Button>
                </FormGroup>
            </Form>
        )
    }
}

class Movie extends Component {
    constructor(props) {
        super(props);
        this.state = {
            avgRating: 0
        }
    }

    componentDidMount() {
        const {dispatch} = this.props;
        if (this.props.selectedMovie == null)
            dispatch(fetchMovie(this.props.movieId));
    }

    render() {
        const ActorInfo = ({actors}) => {
            return actors.map((actor, i) =>
                <p key={i}>
                    <b>{actor.actorname}</b> {actor.charactername}
                </p>
            );
        };

        const ReviewInfo = ({reviews}) => {
            return reviews.map((review, i) =>
                <p key={i}>
                    <b>@{review.username ? review.username : review.user_id}:</b> {review.quote}
                    <Glyphicon glyph={'star'} /> {review.rating}
                </p>
            );
        };

        const DetailInfo = ({currentMovie}) => {
            if (!currentMovie) { // evaluates to true if currentMovie is null
                return <div>Loading...</div>;
            }
            return (
                <Panel>
                    <Panel.Heading>Movie Detail</Panel.Heading>
                    <Panel.Body><Image className="image"
                                       src={currentMovie.imageURL ? currentMovie.imageURL : posterNotFound} thumbnail />
                    </Panel.Body>
                    <ListGroup>
                        <ListGroupItem>{currentMovie.title}</ListGroupItem>
                        <ListGroupItem><ActorInfo actors={currentMovie.actors} /></ListGroupItem>
                        <ListGroupItem>
                            <h4>Average Rating: <Glyphicon glyph={'star'} /> {currentMovie.avgRating} </h4>
                        </ListGroupItem>
                        <ListGroupItem><Panel.Body><ReviewInput movieId={currentMovie._id} /></Panel.Body></ListGroupItem>
                    </ListGroup>
                    <Panel.Body>
                        <h3>Reviews</h3>
                        <ReviewInfo reviews={currentMovie.reviews} />
                    </Panel.Body>
                </Panel>
            );
        };
        return (
            <DetailInfo currentMovie={this.props.selectedMovie} />
        );
    }
}

const mapStateToProps = (state, ownProps) => {
    console.log(ownProps);
    return {
        selectedMovie: state.movie.selectedMovie,
        movieId: ownProps.match.params.movieId
    }
}

export default withRouter(connect(mapStateToProps)(Movie));