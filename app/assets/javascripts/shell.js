$(document).on('turbolinks:load', function () {
    var ENTER_KEY_CODE = 13;

    var clearOutput = function () {
        $('#output').html('');
    };

    var executeCommand = function (command) {
        $.ajax({
            data: {
                command: command
            },
            method: 'POST',
            url: $('#shell').data('url')
        }).done(handleResponse);
    };

    var handleKeyPress = function (event) {
        if (event.which === ENTER_KEY_CODE) {
            var command = $(this).val();
            if (command === 'clear') {
                clearOutput();
            } else {
                printCommand(command);
                executeCommand(command);
            }
            $(this).val('');
        }
    };

    var handleResponse = function (response) {
        if (response.status === 'timeout') {
            printTimeout(response);
        } else {
            printOutput(response);
        }
    };

    var printCommand = function (command) {
        $('#output').append('<p><em>' + command + '</em></p>');
    };

    var printOutput = function (output) {
        if (output) {
            if (output.stdout) {
                var element = $('<p>');
                element.addClass('text-success');
                element.html(output.stdout);
                $('#output').append(element);
            }

            if (output.stderr) {
                var element = $('<p>');
                element.addClass('text-warning');
                element.html(output.stderr);
                $('#output').append(element);
            }

            if (!output.stdout && !output.stderr) {
                var element = $('<p>');
                element.addClass('text-muted');
                element.html($('#output').data('message-no-output'));
                $('#output').append(element);
            }
        }
    };

    var printTimeout = function (output) {
        var element = $.append('<p>');
        element.addClass('text-danger');
        element.html($('#shell').data('message-timeout'));
        $('#output').append(element);
    };

    if ($('#shell').isPresent()) {
        $('#command').focus();
        $('#command').on('keypress', handleKeyPress);
    }
})
;
