import React from 'react';
import Logo from './Logo';
import './Popup.css';
import moment from 'moment';
import { render } from 'react-dom';
import PopupDownloading from './PopupDowloading';
import PopupNotFound from './PopupNotFound';
import { Rifm } from 'rifm';
import { createTheme, MuiThemeProvider } from '@material-ui/core/styles';
import { Checkbox, FormGroup, FormControlLabel, TextField, Button } from '@material-ui/core';

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

class Popup extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      name: "",
      nbMsg: "50",
      format: {
        html: true,
        text: false
      }
    }
  }

  startDownload = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: "setNbMessages",
        count: this.getInteger(this.state.nbMsg),
        format: this.state.format
      }, (response) => {
        render(<PopupDownloading />, window.document.querySelector('#app-container'));
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          chrome.tabs.sendMessage(tabs[0].id, { action: "download" }, (response) => {
          });
        });
      });
    });
  }

  componentDidMount() {

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: "isFetching" }, (response) => {
        if (response && response.status)
          render(<PopupDownloading />, window.document.querySelector('#app-container'));
      });
    });

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: "getConversationName" }, (response) => {
        if (!response || !response.name)
          render(<PopupNotFound />, window.document.querySelector('#app-container'));
        else
          this.setState({ name: response.name });
      });
    });
  }

  handleChangeNbMsg = (value) => {
    this.setState({ nbMsg: value });
  }

  getEstimatedTime(mins) {
    return moment.duration(mins, "minutes").humanize();
  }

  handleInputChange(event) {
    const target = event.target;
    const value = target.checked;
    const name = target.name;

    const format = this.state.format;
    format[name] = value;
    this.setState({
      format: format
    });
  }


  integerAccept = /\d+/g;

  parseInteger = string => (string.match(this.integerAccept) || []).join('');

  formatInteger = string => {
    const parsed = this.parseInteger(string);
    const number = Number.parseInt(parsed, 10);
    if (Number.isNaN(number)) {
      return '';
    }
    return number.toLocaleString('en');
  };

  getInteger = (str) => {
    const parsed = this.parseInteger(str);
    return Number.parseInt(parsed, 10);
  }



  render() {
    return (
      <MuiThemeProvider theme={theme}>
        <div className="App">
          <header className="App-header">
            <Logo />
            <p style={{ marginBottom: 25, width: WIDTH, textAlign: "start", fontSize: 12 }}>
              Conversation: <span style={{
                color: "black",
                fontWeight: "600",
                textOverflow: 'ellipsis',
                whiteSpace: "nowrap",
                width: 100,
                display: 'inline-block',
                overflowX: 'hidden',
                position: 'relative',
                top: 5
              }} >{this.state.name}</span>
            </p>
            <Rifm format={this.formatInteger} value={this.state.nbMsg} onChange={(e) => this.handleChangeNbMsg(e)}>
              {({ value, onChange }) => {
                return <TextField
                  label="Number of messages"
                  placeholder="Enter number..."
                  value={value}
                  onChange={onChange}
                  size="small"
                  inputProps={{ style: { fontSize: 14, width: WIDTH } }} // font size of input text
                />
              }}
            </Rifm>

            {
              this.state.nbMsg.length > 0 && <p style={{
                marginTop: 7,
                textAlign: "start",
                width: WIDTH,
                fontSize: 12,
                marginBottom: 0
              }}>
                Estimated time: <span style={{ color: BLUE, fontWeight: "600" }}> {this.getEstimatedTime(this.getInteger(this.state.nbMsg) / 415)} </span>
              </p>
            }
            <FormGroup row>
              <FormControlLabel
                control={<Checkbox
                  style={{
                    transform: "scale(0.85)",
                  }}
                  name="text"
                  type="checkbox"
                  checked={this.state.format.text}
                  onChange={(e) => this.handleInputChange(e)} />}
                label={<span style={{ fontSize: 14 }}>{"text"}</span>}
              />
              <FormControlLabel
                control={<Checkbox
                  style={{
                    transform: "scale(0.85)",
                  }}
                  name="html"
                  type="checkbox"
                  checked={this.state.format.html}
                  onChange={(e) => this.handleInputChange(e)} />
                }
                label={<span style={{ fontSize: 14 }}>{"html"}</span>}
              />
            </FormGroup>
            <Button
              onClick={() => this.startDownload()}
              disabled={!(this.state.format.text || this.state.format.html)}
              variant="contained"
              color="primary"
              size="small"
              style={{ marginTop: 8, textTransform: 'lowercase' }}
            >
              start
            </Button>
          </header>
        </div>
      </MuiThemeProvider>
    );
  }
};

export default Popup;
