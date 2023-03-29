# 10. Use Beds insteand of Spaces for matching

Date: 2023-03-29

## Status

Accepted

## Context

There are different approaches that can be made to match people into AP's and the approach chosen will
the UI, API, and business processes. Generally it comes down to matching people into beds or spaces within an AP.

## Decision

We are going to match to beds. The API should serve up beds when matching and people should be booked directly into
a bed. This is to make sure people are booked into the correct place and reduce risk of overbooking. Beds will be booked directly by the matcher which should speed up and optimise the booking process. This should improve occupancy rates. AP Managers will be able to appeal a booking if there are concerns, and they will have the ability to move people around their AP.

## Consequences

Some AP Manager's have raised concerns during research about loosing control of their AP's. They will intentionally be loosing control of the booking process but will retain the ability to move people around.

There were also concerns around additonal appeals being made and therefore more work. The appeals process on bookings may increase but this is expected. It should be mitigated by the streamlined approach to bookings. Appeals should primarily be made if there is an issue with the people within an AP.
