echo "Compiling client into js/client.js..."
coffee --join js/client.js -c coffee/client coffee/shared
echo "Compiling server into js/server.js..."
coffee --join js/server.js -c coffee/server coffee/shared