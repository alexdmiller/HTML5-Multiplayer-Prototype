echo "Compiling client into client/js/client.js..."
coffee --join client/js/client.js -c coffee/client coffee/shared
echo "Compiling server into public/js/server.js..."
coffee --join server/server.js -c coffee/server coffee/shared