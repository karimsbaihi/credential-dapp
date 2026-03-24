// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract CredentialRegistry {
    address public admin;
    mapping(address => bool) public isIssuer;
    uint256 private _credentialCounter;

    struct Credential {
        uint256 id;
        address issuer;
        address student;
        string studentEmail;
        string credentialType;   // "COURSE", "COMPETITION", "PROJECT", ...
        string title;            // course name, competition name, project title
        string gradeOrLevel;     // grade, level, place, etc.
        uint256 issuedAt;
        bool valid;
        // Optional extra fields:
        uint256 startDate;
        uint256 endDate;
        string description;
        string metadataURI;
    }

    mapping(uint256 => Credential) private _credentials;
    mapping(address => uint256[]) private _credentialsByStudent;

    event IssuerRegistered(address indexed issuer);
    event IssuerRemoved(address indexed issuer);
    event CredentialIssued(
        uint256 indexed id,
        address indexed issuer,
        address indexed student
    );
    event CredentialRevoked(
        uint256 indexed id,
        address indexed issuer
    );
    event AdminChanged(
        address indexed previousAdmin,
        address indexed newAdmin
    );

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    modifier onlyIssuer() {
        require(isIssuer[msg.sender], "Not authorized issuer");
        _;
    }

    constructor() {
        admin = msg.sender;
        isIssuer[msg.sender] = true;
        emit IssuerRegistered(msg.sender);
    }

    // ---------- Admin ----------

    function changeAdmin(address newAdmin) external onlyAdmin {
        require(newAdmin != address(0), "Invalid address");
        emit AdminChanged(admin, newAdmin);
        admin = newAdmin;
    }

    function registerIssuer(address issuer) external onlyAdmin {
        require(issuer != address(0), "Invalid issuer");
        require(!isIssuer[issuer], "Already issuer");
        isIssuer[issuer] = true;
        emit IssuerRegistered(issuer);
    }

    function removeIssuer(address issuer) external onlyAdmin {
        require(isIssuer[issuer], "Not issuer");
        isIssuer[issuer] = false;
        emit IssuerRemoved(issuer);
    }

    // ---------- Core issuance (minimal params) ----------

    /**
     * Minimal issuance to avoid stack-too-deep:
     * - student
     * - studentEmail
     * - credentialType
     * - title
     * - gradeOrLevel
     */
    function issueCredential(
        address student,
        string calldata studentEmail,
        string calldata credentialType,
        string calldata title,
        string calldata gradeOrLevel
    ) external onlyIssuer returns (uint256) {
        require(student != address(0), "Invalid student address");
        require(bytes(credentialType).length > 0, "Type required");
        require(bytes(title).length > 0, "Title required");

        _credentialCounter += 1;
        uint256 newId = _credentialCounter;

        Credential storage cred = _credentials[newId];
        cred.id = newId;
        cred.issuer = msg.sender;
        cred.student = student;
        cred.studentEmail = studentEmail;
        cred.credentialType = credentialType;
        cred.title = title;
        cred.gradeOrLevel = gradeOrLevel;
        cred.issuedAt = block.timestamp;
        cred.valid = true;

        _credentialsByStudent[student].push(newId);

        emit CredentialIssued(newId, msg.sender, student);
        return newId;
    }

    /**
     * Optional: add or update extended metadata
     * (description, start/end dates, metadataURI) after issuance.
     */
    function updateCredentialMetadata(
        uint256 credentialId,
        string calldata description,
        uint256 startDate,
        uint256 endDate,
        string calldata metadataURI
    ) external {
        Credential storage cred = _credentials[credentialId];
        require(cred.id != 0, "Credential does not exist");
        require(cred.issuer == msg.sender, "Not issuer of this credential");

        cred.description = description;
        cred.startDate = startDate;
        cred.endDate = endDate;
        cred.metadataURI = metadataURI;
    }

    // ---------- Revocation ----------

    function revokeCredential(uint256 credentialId) external {
        Credential storage cred = _credentials[credentialId];
        require(cred.id != 0, "Credential does not exist");
        require(cred.issuer == msg.sender, "Not issuer of this credential");
        require(cred.valid, "Already revoked");

        cred.valid = false;
        emit CredentialRevoked(credentialId, msg.sender);
    }

    // ---------- Read / verification ----------

    function getCredential(uint256 credentialId)
        external
        view
        returns (Credential memory)
    {
        Credential memory cred = _credentials[credentialId];
        require(cred.id != 0, "Credential does not exist");
        return cred;
    }

    function isValid(uint256 credentialId) external view returns (bool) {
        Credential memory cred = _credentials[credentialId];
        if (cred.id == 0) {
            return false;
        }
        return cred.valid;
    }

    function getStudentCredentials(address student)
        external
        view
        returns (uint256[] memory)
    {
        return _credentialsByStudent[student];
    }

    function totalCredentials() external view returns (uint256) {
        return _credentialCounter;
    }
}
