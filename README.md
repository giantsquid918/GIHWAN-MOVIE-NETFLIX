# GIHWAN-MOVIE FLIX

현재 상영 중인 영화 정보를 TMDB에서 불러오는 정적 프런트엔드와 Vercel 서버리스 함수입니다. TMDB API 키는 브라우저에 전달되지 않으며, Vercel 함수에서만 사용됩니다.

## Vercel 배포

1. 프로젝트를 GitHub에 올린 뒤 Vercel에서 해당 저장소를 가져옵니다. 별도의 빌드 명령은 필요하지 않습니다.
2. Vercel 프로젝트의 **Settings → Environment Variables**에서 `TMDB_API_KEY` 이름으로 TMDB API 키를 저장합니다. 값을 `VITE_` 같은 클라이언트 공개용 변수에 넣지 마세요.
3. 환경 변수를 추가한 뒤 프로젝트를 다시 배포합니다.

배포된 사이트는 `/api/now-playing` 서버리스 함수를 통해 TMDB에 요청합니다. 함수는 페이지 1~3 요청만 허용하며 결과를 잠시 캐시합니다.

## 로컬 실행

Vercel CLI가 설치되어 있다면 프로젝트 디렉터리에서 `vercel dev`를 실행하세요. 로컬 환경 변수는 `.env.local`에 다음과 같이 설정할 수 있습니다.

```text
TMDB_API_KEY=your_tmdb_api_key
```

`.env.local`은 Git에 추가하지 마세요. Vercel CLI를 사용하지 않고 파일을 직접 여는 방식으로는 `/api/now-playing` 함수가 실행되지 않습니다.

## 키 유출 대응

이전 키가 저장소에 커밋되었거나 공개된 적이 있다면 TMDB에서 해당 키를 폐기하고 새 키를 발급하세요. 파일을 삭제하는 것만으로는 Git 커밋 기록에 남은 키가 무효화되지 않습니다. 새 키를 Vercel 환경 변수에만 등록하고, 공개 저장소에 올라간 키는 교체 후에도 커밋 기록에서 제거해야 합니다.
