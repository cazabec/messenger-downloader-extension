import React from 'react';
import './Popup.css';
import Logo from './Logo';



const WIDTH = 250;


class PopupNotFound extends React.Component {

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <Logo />
          <p style={{ width: WIDTH, textAlign: "start", fontSize: 12, marginTop: 90 }}>No conversation found</p>
          <p style={{ width: WIDTH, textAlign: "start", fontSize: 12 }} >Please go to <a target="_blank" href="https://www.messenger.com/">messenger.com</a> and open the extension</p>
        </header>
      </div>
    );
  }
};

export default PopupNotFound;
