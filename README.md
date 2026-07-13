# Trail First-Aid Checklist

A hiking trip planner that generates a gear and first-aid checklist tailored to your trip — distance, terrain, season, elevation gain, and whether you're bringing a dog. First-aid guidance is informed by EMT field experience (heat exhaustion vs. heat stroke, frostbite/hypothermia signs, splinting for remote sprains/fractures).

## Stack

- **Backend:** Java 21 / Spring Boot (`backend/`)
- **Frontend:** TBD
- **Planned deployment:** AWS Lambda + API Gateway (backend), S3 + CloudFront (frontend), DynamoDB (persistence)

## Running locally

```
cd backend
./mvnw spring-boot:run
```

The API starts on `http://localhost:8080`.

### Generate a checklist

```
POST /api/checklist
Content-Type: application/json

{
  "miles": 10,
  "terrain": "STRENUOUS",
  "season": "SUMMER",
  "elevationGainFt": 2500,
  "bringingDog": true,
  "overnight": false
}
```

`terrain`: `EASY` | `MODERATE` | `STRENUOUS`
`season`: `SPRING` | `SUMMER` | `FALL` | `WINTER`

## Roadmap

- [ ] Persist checklists (DynamoDB)
- [ ] React frontend
- [ ] User accounts (AWS Cognito)
- [ ] Deploy to AWS
