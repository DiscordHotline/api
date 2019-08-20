resource "cloudflare_record" "api" {
    domain  = "hotline.gg"
    name    = "api2"
    type    = "CNAME"
    value   = "alias.zeit.co"
    proxied = true
}
