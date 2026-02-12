---
name: weather
description: 获取指定城市的天气信息
emoji: ⛅
requires:
  bins: [curl]
---

# Weather 技能

使用 wttr.in 获取天气信息，支持全球城市查询。

## 使用

用户可以用自然语言询问天气，技能会调用 wttr.in API 获取实时天气数据。

### 示例

- "北京今天天气怎么样？"
- "上海现在的天气"
- "New York weather"

## 技术说明

使用 curl 调用 `wttr.in/{city}?format=3` 获取简洁天气信息。

```bash
curl "wttr.in/Beijing?format=3"
# 输出: Beijing: ⛅ +15°C
```

## 依赖

- `curl` - HTTP 客户端
