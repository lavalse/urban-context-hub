set -euo pipefail

API="http://localhost:3000/api/roadworks"

post() {
  curl -s -X POST "$API" \
    -H "Content-Type: application/json" \
    -d "$1" | jq .
}

# 1) Nagoya Station area (ongoing)
post '{
  "title": "名古屋駅前：道路舗装補修（桜通口）",
  "description": "夜間施工。通行止めあり。",
  "status": "ongoing",
  "startDate": "2026-01-05T21:00:00+09:00",
  "endDate": "2026-01-12T05:00:00+09:00",
  "location": { "type": "Point", "coordinates": [136.8815, 35.1709] }
}'

# 2) Sakae (ongoing)
post '{
  "title": "栄：交差点改良工事（久屋大通）",
  "description": "歩行者導線の改善。迂回路あり。",
  "status": "ongoing",
  "startDate": "2026-01-03T09:00:00+09:00",
  "endDate": "2026-02-15T18:00:00+09:00",
  "location": { "type": "Point", "coordinates": [136.9066, 35.1709] }
}'

# 3) Nagoya Castle (planned)
post '{
  "title": "名古屋城周辺：歩道バリアフリー化（予定）",
  "description": "段差解消・舗装更新。",
  "status": "planned",
  "startDate": "2026-01-20T09:00:00+09:00",
  "endDate": "2026-02-20T18:00:00+09:00",
  "location": { "type": "Point", "coordinates": [136.8996, 35.1850] }
}'

# 4) Atsuta Shrine (planned)
post '{
  "title": "熱田神宮周辺：街路樹整備（予定）",
  "description": "剪定・安全点検・歩道清掃。",
  "status": "planned",
  "startDate": "2026-01-18T08:00:00+09:00",
  "endDate": "2026-01-25T17:00:00+09:00",
  "location": { "type": "Point", "coordinates": [136.9080, 35.1271] }
}'

# 5) Nagoya Port (finished)
post '{
  "title": "名古屋港：路面補修（完了）",
  "description": "物流車両の通行量増加に伴う補修。",
  "status": "finished",
  "startDate": "2025-12-10T22:00:00+09:00",
  "endDate": "2025-12-11T05:00:00+09:00",
  "location": { "type": "Point", "coordinates": [136.8430, 35.0900] }
}'

# 6) Kanayama (ongoing)
post '{
  "title": "金山：地下道出入口改修",
  "description": "雨水対策。階段の一部通行制限。",
  "status": "ongoing",
  "startDate": "2026-01-04T10:00:00+09:00",
  "endDate": "2026-01-28T18:00:00+09:00",
  "location": { "type": "Point", "coordinates": [136.9003, 35.1428] }
}'

# 7) Nagoya Dome area (finished)
post '{
  "title": "大曽根：信号設備更新（完了）",
  "description": "制御機更新・配線点検。",
  "status": "finished",
  "startDate": "2025-12-20T23:00:00+09:00",
  "endDate": "2025-12-21T04:30:00+09:00",
  "location": { "type": "Point", "coordinates": [136.9476, 35.1910] }
}'

# 8) Fushimi (planned)
post '{
  "title": "伏見：下水道点検に伴う車線規制（予定）",
  "description": "短時間の片側交互通行。",
  "status": "planned",
  "startDate": "2026-01-14T01:00:00+09:00",
  "endDate": "2026-01-14T05:00:00+09:00",
  "location": { "type": "Point", "coordinates": [136.8956, 35.1671] }
}'
