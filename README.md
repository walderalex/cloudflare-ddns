# Cloudflare Dynamic DNS

This script can be ran using a cron job to maintain a dynamic DNS record.

You must first have a Cloudflare API key with Zone:Zone - Read, Zone:DNS - Edit permissions.

Also retrieve your ZONE ID.

Configure the following environment variables and run the script: `CLOUDFLARE_TOKEN`, `CLOUDFLARE_ZONE_ID`, `SUBDOMAIN`.

`SUBDOMAIN` ought to be the follow domain name, including subdomain of the DNS record to maintain this IP address for.
