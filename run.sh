if [ "$1" = "stop" ]; then
    if [ -f web.pid ]; then
        kill -INT `cat web.pid`
        rm web.pid
        echo "Stopped."
    else
        echo "Game not running."
    fi
else
    if [ -f web.pid ]; then
        kill -INT `cat web.pid`
    fi
    NODE_ENV=development node app.js &
    echo $! > web.pid
    echo "Started."
fi