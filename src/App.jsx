import React, { useRef, useState } from 'react';
import './App.css';
import backgroundImage from './assets/wtspbg.jpg';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { auth, firestore } from './Firebase';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { serverTimestamp, addDoc, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

function App() {
  const [user] = useAuthState(auth);

  const appStyle = {
    backgroundImage: `url(${backgroundImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  };

  return (
    <div style={appStyle} className="App">
      <header style={{
        backgroundColor: '#202C33',
        color: '#FFFFFF',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 15px',
      }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Shadoo Chat</h1>
        <SignOut />
      </header>

      <section style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
      }}>
        {user ? <ChatRoom /> : <SignIn />}
      </section>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user already exists in 'users' collection
      const usersRef = collection(firestore, 'users');
      const querySnapshot = await getDocs(usersRef);
      const userExists = querySnapshot.docs.some(doc => doc.data().email === user.email);

      if (!userExists) {
        // Add new user to 'users' collection
        await addDoc(usersRef, {
          username: user.displayName,
          email: user.email,
          createdAt: serverTimestamp(),
        });
        console.log('User added to Firestore');
      }
    } catch (error) {
      console.error('Error during sign-in:', error);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      color: 'white',
    }}>
      <button className="sign-in" onClick={signInWithGoogle}>
        Sign in with Google
      </button>
      <p>Welcome to Shadoo Chat :)</p>
    </div>
  );
}

function SignOut() {
  return (
    auth.currentUser && (
      <button className="sign-out" onClick={() => firebaseSignOut(auth)}>
        Sign Out
      </button>
    )
  );
}

function ChatRoom() {
  const dummy = useRef();
  const messagesRef = collection(firestore, 'messages');
  const messagesQuery = query(messagesRef, orderBy('createdAt'), limit(25));

  const [messages] = useCollectionData(messagesQuery, { idField: 'id' });
  const [formValue, setFormValue] = useState('');

  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    if (!formValue.trim()) return;

    await addDoc(messagesRef, {
      text: formValue.trim(),
      createdAt: serverTimestamp(),
      uid,
      photoURL,
    });

    setFormValue('');
    dummy.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <main>
        {messages && messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}
        <span ref={dummy}></span>
      </main>

      <form 
        onSubmit={sendMessage}
        style={{
          display: 'flex',
          backgroundColor: '#202C33',
          padding: '10px',
          borderRadius: '10px',
          margin: '0 10px 10px',
        }}
      >
        <input
          style={{
            flex: 1,
            backgroundColor: '#2A3942',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            padding: '10px',
            marginRight: '10px',
          }}
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
          placeholder="Type a message"
        />
        <button 
          type="submit" 
          disabled={!formValue.trim()}
          style={{
            backgroundColor: '#25D366',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: formValue.trim() ? 'pointer' : 'not-allowed',
          }}
        >
          ➤
        </button>
      </form>
    </>
  );
}

function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;
  const messageClass = uid === auth.currentUser?.uid ? 'sent' : 'received';

  return (
    <div className={`message ${messageClass}`}>
      <img
        src={photoURL || `https://ui-avatars.com/api/?name=${auth.currentUser?.displayName}`}
        alt="Avatar"
        className="avatar"
      />
      <p style={{
        backgroundColor: messageClass === 'sent' ? '#005C4B' : '#2A3942',
        color: 'white',
        padding: '10px',
        borderRadius: '10px',
        maxWidth: '70%',
        wordBreak: 'break-word',
      }}>
        {text}
      </p>
    </div>
  );
}

export default App;
