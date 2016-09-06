#!/usr/bin/env bash


sudo bash

# uninstall all existing installation of NGINX
apt-get -y remove nginx nginx-common
apt-get -y purge nginx nginx-common

# install all build essentials
apt-get -y install libreadline-dev libncurses5-dev libpcre3-dev libssl-dev perl make

# download open resty package
wget https://openresty.org/download/openresty-1.9.15.1.tar.gz
tar xvf openresty-1.9.15.1.tar.gz
cd openresty-1.9.15.1/
./configure --with-luajit
make
make install

# download LuaRocks lua package manager
wget http://luarocks.org/releases/luarocks-2.0.13.tar.gz
tar -xzvf luarocks-2.0.13.tar.gz
cd luarocks-2.0.13/
./configure --prefix=/usr/local/openresty/luajit \
    --with-lua=/usr/local/openresty/luajit/ \
    --lua-suffix=jit-2.1.0-alpha \
    --with-lua-include=/usr/local/openresty/luajit/include/luajit-2.1
make
make install

# install cookie management package
/usr/local/openresty/luajit/bin/luarocks-5.1 install lua-resty-cookie

# install jwt management package
/usr/local/openresty/luajit/bin/luarocks-5.1 install --server=http://rocks.moonscript.org luajwt
exit
