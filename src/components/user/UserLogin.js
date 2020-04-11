import React, { Component } from 'react';
import {Link} from 'react-router-dom';

import {Form, Button} from 'react-bootstrap';

import {UserRegisterRoute, GetApiRootUrl} from '../../utils/RoutingPaths';


class UserLogin extends Component {

    state = {
        username: null,
        password: null,
    };

    handleChange = (e) => {
        if(e.target.name === "username"){
            this.setState({username: e.target.value});
        }
        if(e.target.name === "password"){
            this.setState({password: e.target.value});
        }
    }

    updateLoginInfo = (e) => {
        this.props.updateLoginInfo(e);
    }

    loginUser = (e) => {
        e.preventDefault();
         // 1. get the username and password [done]

        // 2. make the request
        const rootUrl = GetApiRootUrl();
        fetch(rootUrl + '/api/Users/Login', {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: this.state.username,
                password: this.state.password
            })

        })
        .then(resp => resp.json())
        .then(resp => {
            this.updateLoginInfo({
                'username' : this.state.username,
                'token' : resp.token
            })
        })
        .catch(err => console.error(err));
    }

    render() {
        return (
            <div className="mt-5">
                <Form method="post" onSubmit={this.loginUser}>
                    <Form.Group controlId="username">
                        <Form.Label>Username</Form.Label>
                        <Form.Control type="text" placeholder="Enter username" name="username" required="required" onChange={this.handleChange} />
                    </Form.Group>

                    <Form.Group controlId="userPassword">
                        <Form.Label>Password</Form.Label>
                        <Form.Control type="password" placeholder="Password" name="password" required="required" onChange={this.handleChange} />
                    </Form.Group>
                    <Button variant="primary" type="submit">
                        Login
                    </Button>
                    <Link to={UserRegisterRoute()} className="ml-1">
                        <Button variant="outline-info">Go to Registration</Button>
                    </Link>
                </Form>
            </div>
        )
    }
}

export default UserLogin