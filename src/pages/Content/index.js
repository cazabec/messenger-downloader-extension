// const conf["DATE_DELIMITER"] = "q45zohi1 ema1e40h do00u71z ni8dbmo4 stjgntxs ttbfdpzt";
// const conf["SCROLLABLE_CONTAINER"] = "buofh1pr j83agx80 eg9m0zos ni8dbmo4 cbu4d94t gok29vw1";
// const conf["MESSAGES"] = "alzwoclg mfclru0v";
// const conf["CONV_NAME"] = "oajrlxb2 g5ia77u1 qu0x051f esr5mh6w e9989ue4 r7d6kgcz rq0escxv nhd2j8a9 nc684nl6 p7hjln8o kvgmc6g5 cxmmr5t8 oygrvhab hcukyx3x jb3vyjys rz4wbd8a qt6c0cv9 a8nywdso i1ao9s8h esuyzwwr f1sip0of lzcic4wl gmql0nx0 gpro0wi8";
// const conf["CONV_NAME_GROUP"] = "d2edcug0 hpfvmrgz qv66sw1b c1et5uql oi732d6d ik7dh3pa ht8s03o8 a8c37x1j keod5gw0 nxhoafnm aigsh9s9 d9wwppkn fe6kdd0r mau55g9w c8b282yb iv3no6db a5q79mjw g1cxx5fr lrazzd5p oo9gr5id oqcyycmt"

// const conf["INVISIBLE_COMMENT"] = "q45zohi1 ema1e40h do00u71z ni8dbmo4 stjgntxs ttbfdpzt";
// const conf["INVISIBLE_COMMENT2"] = "oqcyycmt pipptul6 r9r71o1u lrazzd5p";

// const conf["HEADER"] = 'h6ft4zvz rj2hsocd aesu6q9g e4ay1f3w';

// const conf["MESSAGES_GRID"] = "ns9esd28 tqkqlopc du4w35lb";
// const conf["ENTER_TO_REMOVE"] = "oajrlxb2 gs1a9yip ms7hmo2b mtkw9kbi tlpljxtp qensuy8j ppp5ayq2 goun2846 ccm00jje s44p3ltw mk2mc5f4 rt8b4zig n8ej3o3l agehan2d sk4xxmp2 rq0escxv nhd2j8a9 pq6dq46d mg4g778l btwxx1t3 pfnyh3mw p7hjln8o kvgmc6g5 cxmmr5t8 oygrvhab hcukyx3x tgvbjcpo hpfvmrgz pybr56ya d1544ag0 f10w8fjw tw6a2znq s8sjc6am i1ao9s8h esuyzwwr f1sip0of tkr6xdv7 lzcic4wl abiwlrkh p8dawk7l __fb-dark-mode  dm7saucs ormqv51v i9k17dj3 ue3kfks5 pw54ja7n uo3d90p7 l82x9zwi r92hip7p spvqvc9t ikw5e13s ebnioo9u lq84ybu9 hf30pyar rfd0zzc9"

var conf = {};

loadConf();

var NB_MESSAGES_TO_FETCH = 0;

var nb_messages = 0;
var fetching = false;
var format = null;
var is_scrolling_down = false;

// window.addEventListener("load", myMain, false);

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.action === "download") {
            startDownload();
            sendResponse({});
        }
        if (request.action === "getConversationName") {
            sendResponse({ name: getConversationName() });
        }
        if (request.action === "getProgress") {
            sendResponse(getProgress());
        }
        if (request.action === "downloadFile") {
            if (format.html)
                downloadHTML(getHTML());
            if (format.text)
                downloadText(getText());

            sendResponse({});
        }
        if (request.action === "addMessages") {
            NB_MESSAGES_TO_FETCH += request.count;
        }
        if (request.action === "setNbMessages") {
            NB_MESSAGES_TO_FETCH = request.count;
            format = request.format;
        }
        if (request.action === "getNbFiles") {
            sendResponse({ count: format.html + format.text });
        }
        if (request.action === "isFetching") {
            sendResponse({ status: fetching });
        }
        if (request.action === "stopFetching") {
            fetching = false;
            sendResponse({ status: fetching });
        }
    }
);

function getConversationName() {
    let elems = document.getElementsByClassName(conf["CONV_NAME"]);
    let elem = elems && elems.length > 0 ? elems[0] : null;
    if (elem)
        return elem.innerHTML.replace(/<\/?[^>]+(>|$)/g, "");
    elems = document.getElementsByClassName(conf["CONV_NAME_GROUP"]);
    let parent = elems && elems.length > 0 ? elems[0] : null;
    if (parent && parent.childNodes.length > 0) {
        elem = parent.childNodes[0];
        return elem.innerHTML.replace(/<\/?[^>]+(>|$)/g, "");
    }
    return null;
}

function getFileName() {
    return getConversationName().replace(/\W/g, '')
}

function startDownload() {
    scroll_up();
    fetching = true;
}

function getFirstDate() {
    const date_elems = document.getElementsByClassName(conf["DATE_DELIMITER"]);
    const date_elem = date_elems && date_elems.length > 0 ? date_elems[0] : null;
    return date_elem ? date_elem.innerHTML : 'today';
}

function getNbMessages() {
    return document.getElementsByClassName(conf["MESSAGES"]).length;
}



function loadConf() {
    var getJSON = function (url, callback) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'json';
        xhr.onload = function () {
            var status = xhr.status;
            if (status === 200) {
                callback(null, xhr.response);
            } else {
                callback(status, xhr.response);
            }
        };
        xhr.send();
    };
    var getTxt = function (url, callback) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'text';
        xhr.onload = function () {
            var status = xhr.status;
            if (status === 200) {
                callback(null, xhr.response);
            } else {
                callback(status, xhr.response);
            }
        };
        xhr.send();
    };
    getJSON('https://messenger-downloader-configuration.s3.eu-west-3.amazonaws.com/config.json',
        function (err, data) {
            if (err) {
                console.error('[MESSENGER DOWNLOADER] ', err)
            } else {
                conf = data;
            }
        });
    getTxt('https://messenger-downloader-configuration.s3.eu-west-3.amazonaws.com/template.txt',
        function (err, data) {
            if (err) {
                console.error('[MESSENGER DOWNLOADER] ', err)
            } else {
                conf["template"] = data;
            }
        });
}

function getProgress() {
    return {
        nb_messages,
        total: NB_MESSAGES_TO_FETCH,
        lastDate: getFirstDate()
    };
}

function shouldStop() {
    const lst = document.getElementsByClassName(conf["HEADER"]);
    return lst && lst.length > 0;
}

function scrollDown(scrollable_container) {
    is_scrolling_down = true;
    for (var i = 0; i < 1500; i += 1) {
        for (var j = 0; j < 100000; j += 1);
        scrollable_container.scrollTop = i;
    }
    is_scrolling_down = false;
}

function scroll_up() {
    const scrollable_containers = document.getElementsByClassName(conf["SCROLLABLE_CONTAINER"]);
    const scrollable_container = scrollable_containers && scrollable_containers.length > 0 ? scrollable_containers[0] : null;

    var prev = 0;
    var streak = 1;

    var intervalId = window.setInterval(function () {

        if (is_scrolling_down)
            return;

        nb_messages = getNbMessages();

        if (prev == nb_messages) {
            streak += 1;
        } else {
            prev = nb_messages;
            streak = 1;
        }
        prev = nb_messages;
        if (streak >= 10) {
            streak = 1;
            // console.log('---------- UNLOCK ----------');
            return scrollDown(scrollable_container);
        }

        if (nb_messages >= NB_MESSAGES_TO_FETCH || shouldStop()) {
            nb_messages = Math.max(NB_MESSAGES_TO_FETCH, nb_messages);
            clearInterval(intervalId);
        } else {
            scrollable_container.scrollTop = 0;
        }
    }, 800);
}

function downloadHTML(html) {
    var a = document.body.appendChild(
        document.createElement("a")
    );
    a.download = "messenger_conv_" + getFileName() + ".html";
    a.href = "data:text/html," + encodeURIComponent(html);
    a.click();
}

function downloadText(text) {
    var a = document.body.appendChild(
        document.createElement("a")
    );
    a.download = "messenger_conv_" + getFileName() + ".txt";
    a.href = "data:text/plain," + encodeURIComponent(text);
    a.click();
}

function deleteElemsWithClass(c) {
    let paras = document.getElementsByClassName(c);
    while (paras[0]) {
        paras[0].parentNode.removeChild(paras[0]);
    }
}

function getMessagesInGrid() {
    var container = document.getElementsByClassName(conf["MESSAGES_GRID"]);
    return container ? container[0] : null;
}

function getText() {
    deleteElemsWithClass(conf["INVISIBLE_COMMENT"]);
    deleteElemsWithClass(conf["INVISIBLE_COMMENT2"]);
    var container = getMessagesInGrid();
    return container ? container.innerText : "";
}

function getHTML() {
    deleteElemsWithClass(conf["ENTER_TO_REMOVE"]);
    //deleteElemsWithClass("spvqvc9t ikw5e13s ebnioo9u lq84ybu9 hf30pyar s8sjc6am rfd0zzc9")
    var container = getMessagesInGrid();
    const content = container ? container.innerHTML : "";
    const template = conf["template"];
    return template + content + '</div></body></html>';
}