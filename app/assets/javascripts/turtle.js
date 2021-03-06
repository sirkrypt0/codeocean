var output;
var editor;
var pipeurl;
var filename;
var pendingChanges = -1;
var height;
var width;
var devicePixelRatio = window.devicePixelRatio || 1;

// The `unused_pipe_reference` might get outdated. Somehow...
// Hence, we use the `CodeOceanEditorWebsocket.websocket`
function Turtle(unused_pipe_reference, canvas) {
    var dx, dy, xpos, ypos;
    this.canvas = canvas; // jQuery object

    this.items = [];
    this.canvas.off('click');

    let sendEvent = function (x, y) {
        CodeOceanEditorWebsocket.websocket.send(JSON.stringify({
            'cmd': 'canvasevent',
            'type': '<Button-1>',
            'x': x,
            'y': y
        }));
        CodeOceanEditorWebsocket.websocket.send('\n');
    };

    this.handleArrowKeys = function(e) {
        if (!CodeOceanEditorWebsocket.websocket ||
            CodeOceanEditorWebsocket.websocket.getReadyState() !== WebSocket.OPEN) {
            return;
        }

        switch(e.which) {
            case 37: // left
                sendEvent(140, 160);
                break;

            case 38: // up
                sendEvent(160, 140);
                break;

            case 39: // right
                sendEvent(180, 160);
                break;

            case 40: // down
                sendEvent(160, 180);
                break;

            default: return; // exit this handler for other keys
        }
        e.preventDefault(); // prevent the default action (scroll / move caret)
    }

    $(document).keydown(this.handleArrowKeys);

    this.canvas.click(function (e) {
        if (e.eventPhase !== 2) {
            return;
        }
        e.stopPropagation();
        dx = this.width / (2 * devicePixelRatio);
        dy = this.height / (2 * devicePixelRatio);
        if(e.offsetX===undefined)
        {
            var offset = canvas.offset();
            xpos = e.pageX-offset.left;
            ypos = e.pageY-offset.top;
        }
        else
        {
            xpos = e.offsetX;
            ypos = e.offsetY;
        }
        sendEvent(xpos - dx, ypos - dy);
    });
}

Turtle.prototype.update = function () {
    var i, k, canvas, ctx, dx, dy, item, c, length;
    canvas = this.canvas[0];
    canvas.width = this.get_width() * devicePixelRatio;
    canvas.height = this.get_height() * devicePixelRatio;
    canvas.style.width = `${this.get_width()}px`;
    canvas.style.height = `${this.get_height()}px`;
    ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, this.get_width(), this.get_height());
    ctx.scale(devicePixelRatio, devicePixelRatio);
    length = this.items.length;
    dx = canvas.width / (2 * devicePixelRatio);
    dy = canvas.height / (2 * devicePixelRatio);
    for (i = 0; i < length; i += 1) {
        item = this.items[i];
        c = item.coords;
        switch (item.type) {
        case 'line':
            ctx.beginPath();
            ctx.moveTo(c[0] + dx, c[1] + dy);
            for (k = 2; k < c.length; k += 2) {
                ctx.lineTo(c[k] + dx, c[k + 1] + dy);
            }
            if (item.fill) {
                ctx.strokeStyle = item.fill;
            }
            if (item.width) {
                ctx.lineWidth = item.width;
            }

            ctx.stroke();
            break;
        case 'polygon':
            ctx.beginPath();
            ctx.moveTo(c[0] + dx, c[1] + dy);
            for (k = 2; k < c.length; k += 2) {
                ctx.lineTo(c[k] + dx, c[k + 1] + dy);
            }
            ctx.closePath();
            if (item.fill !== "") {
                ctx.fillStyle = item.fill;
                ctx.strokeStyle = item.fill;
                ctx.fill();
            }
            if (item.width) {
                ctx.lineWidth = item.width;
            }
            ctx.stroke();
            break;
        case 'image':
            break;
        }
    }
};

Turtle.prototype.get_width = function () {
    if (width === undefined) {
        width = this.canvas[0].width;
    }
    return width;
};

Turtle.prototype.get_height = function () {
    if (height === undefined) {
        height = this.canvas[0].height;
    }
    return height;
};

Turtle.prototype.delete = function (item) {
    if (item == 'all') {
        this.items = [];
    } else {
        delete this.items[item];
    }
};

Turtle.prototype.create_image = function (image) {
    this.items.push({type:'image',image:image});
    return this.items.length - 1;
};

Turtle.prototype.create_line = function () {
    this.items.push({type:'line',
                     fill: '',
                     coords:[0,0,0,0],
                     width:2,
                     capstyle:'round'});
    return this.items.length - 1;
};

Turtle.prototype.create_polygon = function () {
    this.items.push({type:'polygon',
                     // fill: "" XXX
                     // outline: "" XXX
                     coords:[0,0,0,0,0,0]
                    });
    return this.items.length - 1;
};

// XXX might make this varargs as in Tkinter
Turtle.prototype.coords = function (item, coords) {
    if (coords === undefined) {
        return this.items[item].coords;
    }
    this.items[item].coords = coords;
};

Turtle.prototype.itemconfigure = function (item, key, value) {
    this.items[item][key] = value;
};

// value might be undefined
Turtle.prototype.css = function (key, value) {
    if (value === undefined) {
        return this.canvas.css(key);
    } else {
        // jQuery return value is confusing when the css is set
        this.canvas.css(key, value);
    }
};

function run(launchmsg) {
    var i, turtlescreen, msg, result, cmd;
    $('#assess').empty();

    turtlescreen = new Turtle();

    output = $('#output');
    output.empty();
    if (typeof pipeurl === 'undefined') {
        if (wp_port == '443') {
            pipeurl = 'wss://'+wp_hostname+'/pipe';
        } else {
            pipeurl = 'ws://'+wp_hostname+':'+wp_port+'/pipe';
        }
    }
    saveFile();
    output.pipe = new WebSocket(pipeurl);
    output.pipe.onopen = function () {
        output.pipe.send(JSON.stringify(launchmsg));
    };
    output.pipe.onmessage = function (response) {
        msg = JSON.parse(response.data);
        if (msg.cmd == 'input') {
            output.inputelem = $('<input>',{'size':40});
            submit = $('<input>',{'type':'submit'});
            submit.click(function (){
                text = output.inputelem.val();
                output.input.replaceWith($('<code>', {text:text+'\n'}));
                output.pipe.send(JSON.stringify({'cmd':'inputresult',
                                                 'data':text}));
            });
        output.inputelem.keydown(function(event){
                if(event.keyCode == 13){
                    submit.click();
                }
        });
            output.append($('<code>', {text:msg.data}));
            output.input = $('<span>').append(output.inputelem).append(submit);
            output.append(output.input);
        output.inputelem.focus();
        } else if (msg.cmd == 'stop') {
            if (launchmsg.cmd == 'runscript') {
                if (msg.timedout) {
                    output.append('<hr>Dein Programm hat zu lange gerechnet und wurde beendet.');
                } else {
                    output.append('<hr>Dein Progamm wurde beendet');
                }
            }
            output.pipe.close();
        } else if (msg.cmd == 'passed') {
            $('#assess').html("Herzlich Glückwunsch! Dein Programm funktioniert korrekt.");
        } else if (msg.cmd == 'failed') {
            $('#assess').html(msg.data);
        } else if (msg.cmd == 'turtle') {
            if (msg.action in turtlescreen) {
                result = turtlescreen[msg.action].apply(turtlescreen, msg.args);
                output.pipe.send(JSON.stringify({cmd:'result', 'result':result}));
            } else {
                output.pipe.send(JSON.stringify({cmd:'exception', exception:'AttributeError',
                                                 message:msg.action}));
            }
        } else if (msg.cmd == 'turtlebatch') {
            for (i=0; i < msg.batch.length; i += 1) {
                cmd = msg.batch[i];
                turtlescreen[cmd[0]].apply(turtlescreen, cmd[1]);
            }
        } else {
            if(msg.stream == 'internal') {
                output.append('<hr><em>Interner Fehler (bitte melden):</em>\n');
            }
        else if (msg.stream == 'stderr') {
        showConsole();
        $('#consoleradio').prop('checked', 'checked');
        }
            output.append($('<code>',{text:msg.data, 'class':msg.stream}));
        }
    };
}
