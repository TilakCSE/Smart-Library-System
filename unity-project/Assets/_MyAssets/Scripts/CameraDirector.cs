using UnityEngine;

public class CameraDirector : MonoBehaviour
{
    [Header("Targets")]
    public Transform agentTarget;

    [Header("Settings")]
    public float distance = 3.5f;
    public float heightOffset = 1.2f;
    public float positionSmoothTime = 0.15f;

    [Header("Mobile Swipe Settings")]
    public float swipeSensitivityX = 4.0f;
    public float swipeSensitivityY = 3.0f;
    public float minYAngle = -5f;
    public float maxYAngle = 70f;

    [Header("Collision Settings")]
    public LayerMask collisionLayers; // Tells the camera what to bounce off of
    public float collisionBuffer = 0.2f; // Keeps the camera from scraping the paint

    private Vector3 currentVelocity;
    private float currentRotX;
    private float currentRotY = 15f;

    void Start()
    {
        if (agentTarget) currentRotX = agentTarget.eulerAngles.y;
    }

    void LateUpdate()
    {
        if (agentTarget == null) return;

        if (Input.GetMouseButton(0))
        {
            currentRotX += Input.GetAxis("Mouse X") * swipeSensitivityX;
            currentRotY -= Input.GetAxis("Mouse Y") * swipeSensitivityY;
            currentRotY = Mathf.Clamp(currentRotY, minYAngle, maxYAngle);
        }

        Quaternion rotation = Quaternion.Euler(currentRotY, currentRotX, 0);
        Vector3 offset = rotation * new Vector3(0, 0, -distance);

        Vector3 targetHeight = agentTarget.position + (Vector3.up * heightOffset);
        Vector3 desiredPos = targetHeight + offset;

        // --- NEW COLLISION LOGIC ---
        RaycastHit hit;
        // Shoot an invisible line from the agent's head to where the camera WANTS to be
        if (Physics.Linecast(targetHeight, desiredPos, out hit, collisionLayers))
        {
            // If the line hits a wall, pull the camera forward to the hit point!
            desiredPos = hit.point + (targetHeight - desiredPos).normalized * collisionBuffer;
        }
        // ---------------------------

        transform.position = Vector3.SmoothDamp(transform.position, desiredPos, ref currentVelocity, positionSmoothTime);
        transform.LookAt(targetHeight);
    }

    public void AutoTiltForArrival()
    {
        currentRotY = 5f;
    }
}