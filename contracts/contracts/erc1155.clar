;; ERC1155-like Multi-Token Contract
;; Implements multi-token functionality similar to ERC1155 standard

;; Constants and Error Codes
(define-constant ERR-INSUFFICIENT-BALANCE (err u100))
(define-constant ERR-UNAUTHORIZED (err u101))
(define-constant ERR-INVALID-TOKEN-ID (err u102))
(define-constant ERR-ZERO-AMOUNT (err u103))
(define-constant ERR-SELF-TRANSFER (err u104))
(define-constant ERR-ARRAY-LENGTH-MISMATCH (err u105))
(define-constant ERR-TOKEN-NOT-FOUND (err u106))
(define-constant ERR-INVALID-PRINCIPAL (err u107))

;; Contract owner
(define-data-var contract-owner principal tx-sender)

;; Token ID counter for unique token generation
(define-data-var next-token-id uint u1)

;; Data Maps

;; Token balances: (owner, token-id) -> balance
(define-map token-balances {owner: principal, token-id: uint} uint)

;; Operator approvals: (owner, operator) -> approved
(define-map operator-approvals {owner: principal, operator: principal} bool)

;; Token metadata URIs: token-id -> uri
(define-map token-uris uint (string-ascii 256))

;; Token existence tracking: token-id -> exists
(define-map token-exists-map uint bool)

;; Total supply tracking: token-id -> total-supply
(define-map token-supplies uint uint)

;; Core Balance and Query Functions

;; @desc Get token balance for a specific owner and token ID
;; @param owner: The principal whose balance to query
;; @param token-id: The token ID to query
;; @returns: The balance amount (0 if not found)
(define-read-only (get-balance (owner principal) (token-id uint))
    (default-to u0 (map-get? token-balances {owner: owner, token-id: token-id}))
)

;; @desc Get multiple balances efficiently in a single call
;; @param owners: List of principals to query
;; @param token-ids: List of token IDs to query (must match owners length)
;; @returns: List of balances corresponding to each owner/token-id pair
(define-read-only (get-balance-batch (owners (list 100 principal)) (token-ids (list 100 uint)))
    (let ((owners-length (len owners))
          (token-ids-length (len token-ids)))
        ;; Ensure arrays have same length
        (asserts! (is-eq owners-length token-ids-length) ERR-ARRAY-LENGTH-MISMATCH)
        
        ;; Map over the pairs and get balances
        (ok (map get-balance-pair (zip owners token-ids)))
    )
)

;; Helper function for batch balance queries
(define-private (get-balance-pair (pair {owner: principal, token-id: uint}))
    (get-balance (get owner pair) (get token-id pair))
)

;; Helper function to zip two lists into pairs
(define-private (zip (owners (list 100 principal)) (token-ids (list 100 uint)))
    (map make-pair owners token-ids)
)

;; Helper function to create owner/token-id pairs
(define-private (make-pair (owner principal) (token-id uint))
    {owner: owner, token-id: token-id}
)

;; @desc Check if a token type exists
;; @param token-id: The token ID to check
;; @returns: True if token exists, false otherwise
(define-read-only (token-exists (token-id uint))
    (default-to false (map-get? token-exists-map token-id))
)

;; @desc Get total supply for a token type
;; @param token-id: The token ID to query
;; @returns: Total circulating supply (0 if token doesn't exist)
(define-read-only (get-total-supply (token-id uint))
    (default-to u0 (map-get? token-supplies token-id))
)

;; @desc Get the contract owner
;; @returns: The principal that owns this contract
(define-read-only (get-contract-owner)
    (var-get contract-owner)
)

;; @desc Get the next token ID that will be assigned
;; @returns: The next available token ID
(define-read-only (get-next-token-id)
    (var-get next-token-id)
)

;; @desc Get token URI for metadata
;; @param token-id: The token ID to query
;; @returns: The URI string (empty if not set)
(define-read-only (get-token-uri (token-id uint))
    (default-to "" (map-get? token-uris token-id))
)

;; @desc Check if an operator is approved for all tokens of an owner
;; @param owner: The token owner
;; @param operator: The potential operator
;; @returns: True if operator is approved, false otherwise
(define-read-only (is-approved-for-all (owner principal) (operator principal))
    (default-to false (map-get? operator-approvals {owner: owner, operator: operator}))
)

;; Operator Approval System

;; @desc Set or unset approval for an operator to manage all tokens
;; @param operator: The principal to approve or revoke
;; @param approved: True to approve, false to revoke
;; @returns: Success response
(define-public (set-approval-for-all (operator principal) (approved bool))
    (begin
        ;; Cannot approve yourself
        (asserts! (not (is-eq tx-sender operator)) ERR-INVALID-PRINCIPAL)
        
        ;; Set or remove approval
        (if approved
            (map-set operator-approvals {owner: tx-sender, operator: operator} true)
            (map-delete operator-approvals {owner: tx-sender, operator: operator})
        )
        
        ;; Emit approval event
        (print {
            event: "approval-for-all",
            owner: tx-sender,
            operator: operator,
            approved: approved
        })
        
        (ok true)
    )
)

;; Helper function to check if a principal is authorized to transfer tokens
;; @param owner: The token owner
;; @param operator: The potential operator
;; @returns: True if authorized (owner or approved operator)
(define-private (is-authorized (owner principal) (operator principal))
    (or 
        (is-eq owner operator)
        (is-approved-for-all owner operator)
    )
)

;; Operator Approval System

;; @desc Set or unset approval for an operator to manage all caller's tokens
;; @param operator: The principal to approve or revoke
;; @param approved: True to approve, false to revoke
;; @returns: Success response
(define-public (set-approval-for-all (operator principal) (approved bool))
    (begin
        ;; Cannot approve yourself as operator
        (asserts! (not (is-eq tx-sender operator)) ERR-INVALID-PRINCIPAL)
        
        ;; Set or remove approval
        (if approved
            (map-set operator-approvals {owner: tx-sender, operator: operator} true)
            (map-delete operator-approvals {owner: tx-sender, operator: operator})
        )
        
        ;; Emit approval event
        (print {
            event: "approval-for-all",
            owner: tx-sender,
            operator: operator,
            approved: approved
        })
        
        (ok true)
    )
)

;; Helper Functions for Transfer Authorization

;; @desc Check if a principal is authorized to transfer tokens on behalf of owner
;; @param owner: The token owner
;; @param operator: The potential operator
;; @returns: True if authorized (owner or approved operator)
(define-private (is-authorized (owner principal) (operator principal))
    (or 
        (is-eq owner operator)  ;; Owner can always transfer their own tokens
        (is-approved-for-all owner operator)  ;; Approved operator can transfer
    )
)

;; @desc Validate that the caller is authorized to transfer tokens
;; @param owner: The token owner
;; @returns: Error if not authorized, ok if authorized
(define-private (assert-authorized (owner principal))
    (asserts! (is-authorized owner tx-sender) ERR-UNAUTHORIZED)
)