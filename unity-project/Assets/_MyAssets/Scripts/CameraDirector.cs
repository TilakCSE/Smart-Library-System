using UnityEngine;

public class CameraDirector : MonoBehaviour
{
    [Header("Targets")]
    public Transform agentTarget;
    public Transform gateOverviewPoint;

    [Header("Settings")]
    // Try these default values first!
    public Vector3 followOffset = new Vector3(0, 5, -7);
    public float positionSmoothTime = 0.5f; // Higher = Smoother/Slower lag
    public float rotationSmoothSpeed = 2.0f;

    private bool isReviewingPath = false;
    private Vector3 currentVelocity; // Helper for smoothing

    void LateUpdate()
    {
        if (agentTarget == null || gateOverviewPoint == null) return;

        Vector3 targetPos;
        Quaternion targetRot;

        if (isReviewingPath)
        {
            // STATE B: OVERVIEW
            targetPos = gateOverviewPoint.position;
            Vector3 directionToAgent = agentTarget.position - transform.position;
            targetRot = Quaternion.LookRotation(directionToAgent);
        }
        else
        {
            // STATE A: SMOOTH CHASE

            // 1. Calculate desired position (Behind player)
            // TransformPoint keeps it locked to agent's rotation, but we smooth the movement
            Vector3 desiredWorldPos = agentTarget.TransformPoint(followOffset);

            // 2. Use SmoothDamp for the position (Removes the jitter)
            targetPos = Vector3.SmoothDamp(transform.position, desiredWorldPos, ref currentVelocity, positionSmoothTime);

            // 3. Look at the agent's head, but do it lazily
            Vector3 lookAtPoint = agentTarget.position + (Vector3.up * 1.5f);
            Vector3 direction = lookAtPoint - transform.position;

            // Prevent error if direction is zero
            if (direction != Vector3.zero)
                targetRot = Quaternion.LookRotation(direction);
            else
                targetRot = transform.rotation;
        }

        // Apply
        transform.position = targetPos;
        transform.rotation = Quaternion.Slerp(transform.rotation, targetRot, Time.deltaTime * rotationSmoothSpeed);
    }

    public void SwitchToOverviewMode() { isReviewingPath = true; }
    public void SwitchToFollowMode() { isReviewingPath = false; }
}