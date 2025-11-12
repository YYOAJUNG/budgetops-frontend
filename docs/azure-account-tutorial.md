# Azure 계정 연동 튜토리얼

Budgetops에 Azure 계정을 안전하게 연결하고 리소스·비용 데이터를 수집하려면 아래 순서를 따라 주세요.  
GCP 튜토리얼과 동일한 구성으로 작성되어 있으니 팀 내 위키/문서화에 그대로 추가해도 됩니다.

---

## 1. 준비물

- **Azure Portal** 에 액세스 가능한 관리자 계정
- **Azure 구독(Subscription)** 이 1개 이상 존재할 것
- Budgetops **엔터프라이즈 플랜** 혹은 Azure 연동이 활성화된 워크스페이스

Budgetops에서는 다음 값이 필요합니다.

| Budgetops 필드 | 설명 | 획득 경로 |
| --- | --- | --- |
| Subscription ID | 비용·리소스를 조회할 Azure 구독의 ID | Azure Portal → 구독 → 해당 구독 → 개요 |
| Tenant ID | Azure Active Directory(Entra ID) 테넌트 ID | Azure Portal 오른쪽 상단 “디렉터리 + 구독” 패널 또는 Azure AD 개요 화면 |
| Client ID | 등록한 애플리케이션(서비스 프린시펄)의 애플리케이션(클라이언트) ID | Azure AD → 앱 등록 → 애플리케이션 개요 |
| Client Secret | 서비스 프린시펄의 인증용 비밀 키 | Azure AD → 앱 등록 → 인증서 및 비밀 → 새 클라이언트 암호 |

---

## 2. 서비스 프린시펄(애플리케이션) 생성

1. **Azure Portal** 에 로그인 후, 왼쪽 메뉴에서 **Microsoft Entra ID (구 Azure Active Directory)** 를 선택합니다.
2. **앱 등록(App registrations)** → **새 등록(New registration)** 을 클릭합니다.
3. 애플리케이션 이름을 입력하고, 지원 계정 유형은 기본값(단일 테넌트)으로 두어도 됩니다.
4. 등록이 완료되면 애플리케이션 개요 화면에서 **애플리케이션(클라이언트) ID** 와 **디렉터리(테넌트) ID** 를 복사해 두세요.
5. 왼쪽 메뉴의 **인증서 및 비밀(Certificates & secrets)** → **새 클라이언트 비밀(New client secret)** 을 생성합니다.
   - 설명과 만료 기간을 입력 후 생성하면 **한 번만** 표시되는 비밀 값이 나타납니다. Budgetops에 입력해야 하므로 안전한 곳에 복사해 두세요.

> ❗️클라이언트 비밀은 “값(Value)” 을 사용해야 하며, “비밀 ID(Secret ID)” 가 아닙니다.

---

## 3. 구독에 권한 부여 (RBAC)

생성한 서비스 프린시펄이 구독 리소스를 조회할 수 있도록, 구독 레벨에서 필수 역할을 부여해야 합니다.

1. Azure Portal에서 **구독(Subscriptions)** → 연결하려는 구독을 선택합니다.
2. 왼쪽 메뉴에서 **액세스 제어(IAM)** → **역할 할당 추가(Add role assignment)** 를 클릭합니다.
3. 아래 역할을 순서대로 추가합니다. (모두 “사용자, 그룹, 서비스 주체” 대상)
   - **Reader** : 구독 내 리소스 조회
   - **Cost Management Reader** : 비용 API 사용
   - **Monitoring Reader** (필요 시) : 메트릭 조회
4. “구성원 선택” 단계에서 방금 만든 서비스 프린시펄 이름(또는 클라이언트 ID)을 검색해 선택합니다.
5. 검토 및 할당으로 마무리하면 RBAC 권한 부여가 완료됩니다.

> ⚠️권한 변경이 즉시 반영되지 않을 수 있습니다. 최대 수 분 정도 대기 후 Budgetops에서 연동을 시도해 주세요.

---

## 4. Budgetops에서 계정 연동

1. Budgetops 웹에서 **내 정보 → 클라우드 계정 연동** 으로 이동합니다.
2. **Azure** 탭을 선택 후 아래 항목을 입력합니다.
   - 계정 이름 (예: `Production Azure`)
   - Subscription ID
   - Tenant ID
   - Client ID
   - Client Secret
3. **계정 연동** 을 클릭하면 자격 증명 검증 후 토큰이 발급되고, Azure 구독이 Budgetops에 연결됩니다.
4. 연동이 성공하면 리소스 페이지에서 Azure VM 목록과 메트릭을 확인할 수 있습니다.

---

## 5. 자격 증명 검증 & 테스트 방법

Budgetops는 연동 시 아래 항목을 자동으로 검사합니다.

1. **OAuth 토큰 발급** : `https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token`
2. **구독 정보 조회** : `GET https://management.azure.com/subscriptions/{subscriptionId}?api-version=2020-01-01`

성공 시 계정이 활성화되며, 리소스와 비용 수집 작업이 시작됩니다.
필요하다면 아래 PowerShell/Azure CLI 명령으로도 권한을 점검할 수 있습니다.

```bash
# Azure CLI 로그인
az login

# 서비스 프린시펄 권한 확인
az role assignment list --assignee <APP_ID> --scope /subscriptions/<SUBSCRIPTION_ID>
```

---

## 6. 문제 해결 가이드

| 오류 메시지 | 원인 | 해결 방법 |
| --- | --- | --- |
| `AADSTS7000215: Invalid client secret provided` | 잘못된 클라이언트 비밀(Secret Value) | 인증서 및 비밀에서 새 비밀을 생성하고 “값”을 복사 |
| `AuthorizationFailed` | RBAC 권한 미부여 | 구독 IAM에서 Reader / Cost Management Reader / Monitoring Reader 역할이 있는지 확인 |
| `NullOrEmptyParameter` | Subscription ID 또는 Tenant ID 누락 | 입력값을 다시 확인. 하이픈 포함 여부 주의 |
| 비용이 0원으로 표시 | Cost Management API 데이터 지연 또는 권한 부족 | Cost Management Reader 역할 확인, 약간의 지연 후 재시도 |
| 퍼블릭 IP가 `N/A` | VM에 Public IP가 연결되지 않음 | 네트워크 인터페이스에 Public IP가 매핑돼 있는지 확인 |

---

## 7. 보안 체크리스트

- 서비스 프린시펄은 **최소 권한 원칙(Least Privilege)** 으로 필요한 역할만 부여하세요.
- 클라이언트 비밀은 비공개 저장소(예: Vault, Secrets Manager)에 보관하세요.
- 비밀 만료 정책에 따라 주기적으로 갱신하고 Budgetops에도 업데이트 하세요.
- Budgetops 웹에서 더 이상 사용하지 않는 계정은 **비활성화 또는 삭제** 하세요.

---

## 8. 요약

1. Azure AD에서 앱을 등록하고 Client ID·Tenant ID·Secret 확보
2. 구독 IAM에서 Reader / Cost Management Reader / Monitoring Reader 역할 부여
3. Budgetops에 Subscription ID + 자격 증명 입력
4. 연동 성공 후 리소스·비용이 자동 수집

문서나 UI에 튜토리얼을 삽입할 때는 본 Markdown을 링크하거나 그대로 활용하면 됩니다.  
추가 질문이 있다면 @cloud-team 채널 혹은 Ops에 문의해 주세요.


