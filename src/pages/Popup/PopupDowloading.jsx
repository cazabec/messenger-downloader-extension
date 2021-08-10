import React from 'react';
import Logo from './Logo';
import './Popup.css';
import ProgressBar from 'react-bootstrap/ProgressBar';
import 'bootstrap/dist/css/bootstrap.min.css';
import moment from 'moment';
import { Button } from '@material-ui/core';
import { createTheme, MuiThemeProvider } from '@material-ui/core/styles';

const BLUE = "#1182ff"
const WIDTH = 250;

const theme = createTheme({
  palette: {
    primary: {
      main: BLUE,
    },
    secondary: {
      main: BLUE,
    },
  },
});

class PopupDownloading extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      progress: 0,
      time: 0,
      nbMsgLeft: 10000,
      lastDate: "yesterday",
      count: 1,
    }
  }

  refresh = () => {
    this.setState({ time: Date.now() });
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: "getProgress" }, (response) => {
        if (response) {
          const progress = Math.round((response.nb_messages * 100) / response.total);
          if (response.nb_messages >= response.total)
            clearInterval(this.interval);
          this.setState({ progress, nbMsgLeft: response.total - response.nb_messages, lastDate: response.lastDate });
        }
      });
    });
  }

  getEstimatedTime(mins) {
    return moment.duration(mins, "minutes").humanize();
  }

  componentDidMount() {
    this.interval = setInterval(() => this.refresh(), 1000);
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: "getNbFiles" }, (response) => {
        if (response)
          this.setState({ nbFiles: response.count });
      });
    });
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  downloadFile() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: "downloadFile" }, (response) => {
        this.sendStopFetching();
      });
    });
  }

  sendStopFetching() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: "stopFetching" }, (response) => {
      });
    });
  }

  fetchMoreMessages() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: "addMessages", count: 100 }, (response) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          chrome.tabs.sendMessage(tabs[0].id, { action: "download" }, (response) => {
            this.interval = setInterval(() => this.refresh(), 1000);
          });
        });
      });
    });
  }

  render() {
    return (
      <MuiThemeProvider theme={theme}>
        <div className="App">
          <header className="App-header">
            <Logo />
            <p style={{ width: WIDTH, textAlign: "start", fontSize: 12 }} >Do not close the extension until the download has finished.</p>
            <ProgressBar animated style={{ width: WIDTH, marginBottom: 6 }} now={this.state.progress} label={`${Math.min(100, this.state.progress)}%`} />
            <p style={{ width: WIDTH, textAlign: "start", fontSize: 12 }}>Estimated time: <span style={{ color: BLUE, fontWeight: "600" }}>{this.getEstimatedTime(this.state.nbMsgLeft / 100)}</span></p>
            <p style={{ width: WIDTH, textAlign: "start", fontSize: 12 }} >Between <span style={{ color: BLUE, fontWeight: "600" }}>today </span> and <span style={{ color: BLUE, fontWeight: "600" }}>{this.state.lastDate} </span></p>
            {
              this.state.nbMsgLeft <= 0 ? <div>
                <Button
                  onClick={() => this.fetchMoreMessages()}
                  variant="contained"
                  color="primary"
                  size="small"
                  style={{ marginTop: 8, textTransform: 'lowercase' }}
                >
                  fetch 100 more
                </Button>
                {'       '}
                <Button
                  onClick={() => this.downloadFile()}
                  variant="contained"
                  color="primary"
                  size="small"
                  style={{ marginTop: 8, textTransform: 'lowercase' }}
                >
                  {this.state.nbFiles > 1 ? `download ${this.state.nbFiles} files` : 'download file'}
                </Button>
              </div> : <div style={{ height: 40 }}></div>
            }
          </header>
        </div>
      </MuiThemeProvider >
    );
  }
};

export default PopupDownloading;
