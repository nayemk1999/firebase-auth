import React from 'react';
import firebase from "firebase/app";
import "firebase/auth";
import { useState } from 'react';
import firebaseConfig from '../../firebaseConfig'

// // firebase.initializeApp(firebaseConfig);

if (firebase.apps.length === 0) {
    firebase.initializeApp(firebaseConfig);
}
const Home = () => {
    const gProvider = new firebase.auth.GoogleAuthProvider();
    var ghProvider = new firebase.auth.GithubAuthProvider();

    const [newUser, setNewUser] = useState(false);
    const [user, setUser] = useState({
        isSignedIn: false,
        name: '',
        email: '',
        password: '',
        photo: '',
        error: '',
        success: false
    })
    const authSignIn = (props) => {
        //AuthProvider
        firebase.auth()
            .signInWithPopup(props)
            .then(res => {
                const { displayName, email, photoURL } = res.user
                const isSignInUser = {
                    isSignedIn: true,
                    name: displayName,
                    email: email,
                    photo: photoURL
                }
                setUser(isSignInUser)
            })
            .catch((error) => {
                var errorCode = error.code;
                var errorMessage = error.message;
                var email = error.email;
                console.log(errorCode, errorMessage, email);
            });
    }
    
    const handleSignInGoogle = () => {
        authSignIn(gProvider)
    }

const handleSignInGithub = () => {
    authSignIn(ghProvider)
}
    const handleSignOut = () => {
        firebase.auth().signOut()
            .then(() => {
                setUser({})
            })
            .catch((error) => {
            });
    }

    const handleBlur = (e) => {
        let isFieldValid;
        if (e.target.name === 'email') {
            const isEmailValid = /\S+@\S+\.\S+/.test(e.target.value)
            isFieldValid = isEmailValid;
        }
        if (e.target.name === 'password') {
            const isPassword = e.target.value.length > 6;
            const isPasswordNumber = /\d{1}/.test(e.target.value);
            isFieldValid = isPasswordNumber && isPassword
        }
        if (isFieldValid) {
            const newUserInfo = { ...user }
            newUserInfo[e.target.name] = e.target.value;
            setUser(newUserInfo)
        }
    }
    const handleSubmit = (e) => {
        if (newUser && user.email && user.password) {
            firebase.auth().createUserWithEmailAndPassword(user.email, user.password)
                .then(res => {
                    const newUserInfo = { ...user }
                    newUserInfo.error = '';
                    newUserInfo.success = true
                    setUser(newUserInfo)
                    updateProfile(user.name)
                })
                .catch(error => {
                    const newUserInfo = { ...user }
                    newUserInfo.error = error.message;
                    newUserInfo.success = false
                    setUser(newUserInfo)
                });
        }
        if (!newUser && user.email && user.password) {
            firebase.auth().signInWithEmailAndPassword(user.email, user.password)
                .then(res => {
                    const newUserInfo = { ...user }
                    newUserInfo.error = '';
                    newUserInfo.success = true
                    setUser(newUserInfo)
                })
                .catch(error => {
                    const newUserInfo = { ...user }
                    newUserInfo.error = error.message;
                    newUserInfo.success = false
                    setUser(newUserInfo)
                });
        }
        e.preventDefault();

    }

    const updateProfile = name => {
        const user = firebase.auth().currentUser;
        user.updateProfile({
            displayName: name,
            photoURL: "https://example.com/jane-q-user/profile.jpg"
        }).then(res => {
            console.log(user.displayName);
        }).catch(function (error) {
            // An error happened.
        });
    }

    return (
        <div>
            {
                user.isSignedIn ? <button onClick={handleSignOut}>Sign Out</button> : <button onClick={handleSignInGoogle}>Sign In Using Google</button>
            } <br/>
            {
                user.isSignedIn ? <button onClick={handleSignOut}>Sign Out</button> : <button onClick={handleSignInGithub}>Sign In Using Git Hub</button>
            }
            {
                user.isSignedIn &&
                <div>
                    <p>Welcome {user.name}</p>
                    <p>{user.email}</p>
                    <img src={user.photo} alt="" />
                </div>
            }
            <h2>Login Form: </h2>
            <input type="checkbox" name="newUser" onChange={() => setNewUser(!newUser)} id="" />
            <label htmlFor="newUser">New User Sign Up</label>
            <form onSubmit={handleSubmit}>
                {
                    newUser && <input type="text" name="name" id="" placeholder="Enter Your Name" />
                }
                <br />
                <input type="text" name="email" onBlur={handleBlur} placeholder='Enter Your Email' required /> <br />
                <input type="password" name="password" onBlur={handleBlur} id="" placeholder="Enter Your Password" required /> <br />
                {newUser ? <input type="submit" value="Sign Up" /> : <input type="submit" value="Sign In" />}
            </form>
            <p style={{ color: 'red' }}>{user.error}</p>
            {
                user.success && <p style={{ color: 'green' }}>User {newUser ? 'Create' : 'Logged In'} Successfully</p>
            }
        </div>
    );
};

export default Home;