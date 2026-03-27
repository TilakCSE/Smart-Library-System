using UnityEngine;
using UnityEngine.AI;

public class LibraryController : MonoBehaviour
{
    [Header("Components")]
    public NavMeshAgent agent;
    public TrailRenderer pathTrail;
    public Light headSpotlight;
    public GameObject skyBeam;
    public CameraDirector cameraDirector;

    private bool isMoving = false;
    private Transform currentTargetRack;

    // NEW: Stores the location sent from React until the user taps
    private string pendingTarget = "";

    public static LibraryController Instance;

    void Awake()
    {
        Instance = this;
        gameObject.name = "LibraryManager";

        if (agent == null) agent = GetComponent<NavMeshAgent>();

        if (pathTrail) pathTrail.enabled = false;
        if (headSpotlight) headSpotlight.enabled = false;
        if (skyBeam) skyBeam.SetActive(false);
    }

    void Start()
    {
        if (cameraDirector == null && Camera.main != null)
        {
            cameraDirector = Camera.main.GetComponent<CameraDirector>();
        }
    }

    // React calls this! It no longer moves the agent, just queues the destination.
    public void GoToLocation(string fullLocationID)
    {
        pendingTarget = fullLocationID;
        Debug.Log("Target Queued from React: " + pendingTarget + ". Waiting for user input...");
    }

    void Update()
    {
        // --- NEW INPUT LOGIC ---
        // Checks for Spacebar, Mouse Click, or Mobile Screen Tap
        bool isInputTriggered = Input.GetKeyDown(KeyCode.Space) ||
                                Input.GetMouseButtonDown(0) ||
                                (Input.touchCount > 0 && Input.GetTouch(0).phase == TouchPhase.Began);

        // If the user tapped AND React has sent us a target string
        if (isInputTriggered && !string.IsNullOrEmpty(pendingTarget))
        {
            ExecuteMovement(pendingTarget);
            pendingTarget = ""; // Clear the queue so it doesn't fire twice!
        }
        // -----------------------

        if (isMoving && !agent.pathPending)
        {
            float dist = agent.remainingDistance;
            if (dist <= agent.stoppingDistance || dist < 0.5f)
            {
                ArrivedAtDestination();
            }
        }
    }

    // All the heavy 48-Shelf parsing logic was moved down here
    private void ExecuteMovement(string targetID)
    {
        string[] parts = targetID.Split('_');

        if (parts.Length < 4)
        {
            Debug.LogError("Error: Expected format Rack_X_Shelf_Y");
            return;
        }

        string rackName = parts[0] + "_" + parts[1];
        int shelfNumber = int.Parse(parts[3]);

        GameObject rackObject = GameObject.Find(rackName);

        if (rackObject != null)
        {
            currentTargetRack = rackObject.transform;
            isMoving = true;

            if (headSpotlight) headSpotlight.enabled = false;
            if (skyBeam) skyBeam.SetActive(false);
            if (pathTrail)
            {
                pathTrail.Clear();
                pathTrail.enabled = true;
            }

            Transform targetPoint;
            if (shelfNumber <= 24)
            {
                targetPoint = rackObject.transform.Find("Front_Point");
            }
            else
            {
                targetPoint = rackObject.transform.Find("Back_Point");
            }

            if (targetPoint != null)
            {
                agent.SetDestination(targetPoint.position);
                agent.stoppingDistance = 0.1f;
            }
            else
            {
                Debug.LogError("Could not find Front_Point or Back_Point in " + rackName);
            }
        }
        else
        {
            Debug.LogError("Rack not found: " + rackName);
        }
    }

    private void ArrivedAtDestination()
    {
        if (!isMoving) return;
        isMoving = false;

        if (currentTargetRack != null)
        {
            Vector3 lookDirection = currentTargetRack.position - agent.transform.position;
            lookDirection.y = 0;
            agent.transform.rotation = Quaternion.LookRotation(lookDirection);
        }

        if (skyBeam) skyBeam.SetActive(true);
        if (headSpotlight) headSpotlight.enabled = true;

        if (cameraDirector) cameraDirector.AutoTiltForArrival();
    }
}