package.path = package.path .. "/usr/local/openresty/lualib/resty/?.lua;"
package.path = package.path .. "/usr/local/openresty/luajit/share/lua/5.1/?.lua;"
package.path = package.path .. "/usr/local/openresty/luajit/share/lua/5.1/resty/?.lua;;"
local key = "opinio123"
local isDebug = true

local sep = "/"
local store = "";

for str in string.gmatch(ngx.var.uri, "([^" .. sep .. "]+)") do
    store = str
    break
end

if not store then
    ngx.log(ngx.ERR, "store not found")
    return ngx.exit(400)
end

local redis = require "resty.redis"
local red = redis:new()

red:set_timeout(1000)

local connectionSuccess, err = red:connect("127.0.0.1", 6379)
if not connectionSuccess then
    ngx.log(ngx.ERR, "failed to connect to redis: ", err)
    return ngx.exit(500)
end

local host, err = red:get(store)
if not host then
    ngx.log(ngx.ERR, "failed to get store Couchdb: ", err)
    return ngx.exit(400)
end

if host == ngx.null then
    ngx.log(ngx.ERR, "no host found for store " .. store)
    return ngx.exit(400)
end

ngx.var.target = host
ngx.log(ngx.ERR, "host for store " .. host)


--[[ todo: refine the mechanism for non auth end points --]]
--[[ todo: add DDOS attack prevention mechanism --]]
if store == "_session" then
    if isDebug then
        return ngx.say("auth successful")
    end
    return
end

--[[ function validating JWT --]]
local function validate(token, resource)
    local jwt = require "luajwt"
    local decoded, err = jwt.decode(token, key, true)

    if (not decoded) or err then
        ngx.log(ngx.ERR, err)
        return false
    else
        if (decoded["iss"] == resource) then
            return true
        else
            return false
        end
    end
end

--[[
Support for Cookie based Proxy Auth
--]]
local cookieManager = require "cookie"
local cookie, err = cookieManager:new()

if not cookie then
    ngx.log(ngx.ERR, err)
    return ngx.exit(500)
end

local token, err = cookie:get("AuthSession")

if token then
    local valid = validate(token, store);
    if not valid then
        ngx.log(ngx.ERR, err)
        return ngx.exit(400)
    else
        return ngx.say("auth successful")
    end
else
    --[[
    Support for Basic Auth
    --]]
    if ngx.var.remote_passwd then
        local valid = validate(ngx.var.remote_passwd, store);
        if not valid then
            ngx.log(ngx.ERR, err)
            return ngx.exit(400)
        else
            return ngx.say("auth successful")
        end
    else
        ngx.log(ngx.ERR, err)
        return ngx.exit(400)
    end
end
