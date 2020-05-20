import React, { Component } from 'react'
import {Link} from 'react-router-dom';
import {Card, Form, Button, Alert} from 'react-bootstrap';
import axios from 'axios';

import {GetApiRootUrl, BlogListRoute, UserLoginRoute} from '../../utils/RoutingPaths';
import {getUserToken, getUserID} from '../../utils/localStorageHelper';

class EditBlog extends Component {
    _isMounted = false;

    state = {
        blogID: 0,
        title: '',
        description: '',
        private: false,
        selectedBlogTopic: 0,
        blogTopics: [],
        token: '',
        errors: ''
    };
    
    getTokenAndUserID = () => {
        if(this.props.user.userID !== 0){
            return [this.props.user.token, this.props.user.userID]
        } else {
            return [getUserToken(), getUserID()]
        }
    }

    componentDidMount() {
        this._isMounted = true;

        if (this.props.user.userID === 0 && getUserID() === null) {
            this.props.history.push(`${UserLoginRoute}`);
        } else {
            const [token, userID] = this.getTokenAndUserID();
            const blogID = this.props.match.params.id;
            if(userID !== 0) {
                if(this._isMounted) {
                    this.setState({token: token})
                }
                const url = GetApiRootUrl + `/api/Blogs/${blogID}`; // TODO : Might need to change
                axios.get(url,{
                    headers: { Authorization: `Bearer ${token}` }
                })
                .then(response => {
                    if (response.status === 200) {
                        const data = response.data;
                        this.setState({
                            blogID : data.blogID,
                            title : data.title,
                            description : data.description,
                            private : data.private,
                            selectedBlogTopic : data.topicID
                        })
                        // Get topic list from db
                        const url = GetApiRootUrl + `/api/Topics`;
                        axios.get(url,{
                            headers: { Authorization: `Bearer ${token}` }
                        })
                        .then(response => {
                            if (response.status === 200) {
                                const data = response.data;
                                if(this._isMounted) {
                                    this.setState({blogTopics: data})
                                }
                            }
                        }).catch(error => {
                            if (error.response) { 
                                console.log("Blog Topic fetch error");
                            }
                        })
                    }
                    console.log(this.state);
                }).catch(error => {
                    if (error.response) { 
                        console.log(error.response);
                    }
                })
            }
        }
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    handleChange = (e) => {
        if(e.target.name === "title"){
            this.setState({title: e.target.value});
        }
        if(e.target.name === "description"){
            this.setState({description: e.target.value});
        }
        if(e.target.name === "private"){
            this.setState({private: e.target.checked});
        }
        if(e.target.name === "selectedBlogTopic"){
            this.setState({selectedBlogTopic: e.target.value});
        }
    }

    handleSubmit = (event) => {
        event.preventDefault();

        if(this.state.title === '' || this.state.description === '') {
            this.setState({'errors' : "Title and Description must be present"});
            return;
        }

        const url = GetApiRootUrl + `/api/Blogs/${this.state.blogID}`;
        axios.put(url, {
            blogId: this.state.blogID,
            title: this.state.title,
            description: this.state.description,
            private: this.state.private,
            topicId: this.state.selectedBlogTopic
        },{
            headers: { Authorization: `Bearer ${this.state.token}` }
        }
        ).then(response => {
            if(response.status === 200) {
                console.log("Blog Edited");
                this.props.history.push(`${BlogListRoute}`);
            }
        }).catch(error => {
            console.log(error);
        })
    }

    generateDropDown(blogTopicsList) {
        return blogTopicsList.map((topics) =>
                <option key={topics.blogTopicID} value={topics.blogTopicID}>{topics.name}</option>
        );
    }

    renderEditBlogForm() {
        return(
            <div className="mt-3">
                {this.state.errors !== '' &&
                    <Alert variant='danger'>
                        {this.state.errors}
                    </Alert>
                }
                <Form method="post" onSubmit={this.handleSubmit}>

                    <Form.Group controlId="blogID">
                        <Form.Control type="hidden" value={this.state.blogID} placeholder="Enter blog title..." name="blogID" />
                    </Form.Group>

                    <Form.Group controlId="title">
                        <Form.Label>Blog Title</Form.Label>
                        <Form.Control type="text" value={this.state.title} placeholder="Enter blog title..." name="title" required="required" onChange={this.handleChange} />
                    </Form.Group>

                    <Form.Group controlId="description">
                        <Form.Label>Description</Form.Label>
                        <Form.Control as="textarea" rows="5" value={this.state.description} placeholder="Blog Description..." name="description" onChange={this.handleChange} />
                    </Form.Group>

                    <Form.Group controlId="selectedBlogTopic">
                        <Form.Label>Blog Topic</Form.Label>
                        <Form.Control as="select" name="selectedBlogTopic" value={this.state.selectedBlogTopic} onChange={this.handleChange}>
                            {this.generateDropDown(this.state.blogTopics)}
                        </Form.Control>
                    </Form.Group>

                    <Form.Group id="private">
                        <Form.Check type="checkbox" checked={this.state.private} label="Make blog private" name="private" onChange={this.handleChange} />
                    </Form.Group>

                    <Button variant="primary" type="submit">
                        Save Changes
                    </Button>
                    <Link to={BlogListRoute} className="ml-1">
                        <Button variant="outline-info">Go to Blog List</Button>
                    </Link>
                </Form>
            </div>
        )
    }

    render() {    
        return (
            <div className="mt-2">
                <Card className="text-center">
                    <Card.Header>Edit Blog</Card.Header>
                </Card>
                {this.renderEditBlogForm()}
            </div>
        )
    }
}

export default EditBlog
