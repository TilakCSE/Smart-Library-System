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

    [Header("Settings")]
    public float stopDistance = 1.5f;

    private bool isMoving = false;
    public static LibraryController Instance;

    void Awake()
    {
        Instance = this;
        gameObject.name = "LibraryManager";

        // FIX: Ensure components are grabbed immediately
        if (agent == null) agent = GetComponent<NavMeshAgent>();

        // FIX: Disable visuals HERE (Before React can send any commands)
        if (pathTrail) pathTrail.enabled = false;
        if (headSpotlight) headSpotlight.enabled = false;
        if (skyBeam) skyBeam.SetActive(false);
    }

    void Start()
    {
        // Only grab the camera here as it might not be ready in Awake
        if (cameraDirector == null) cameraDirector = Camera.main.GetComponent<CameraDirector>();
    }

    public void GoToLocation(string locationID)
    {
        GameObject targetInfo = GameObject.Find(locationID);

        if (targetInfo != null)
        {
            isMoving = true;

            // VISUALS: Turn ON
            if (headSpotlight) headSpotlight.enabled = false;
            if (skyBeam) skyBeam.SetActive(false);

            if (pathTrail)
            {
                pathTrail.Clear();
                pathTrail.enabled = true; // This will now STAY true
            }

            if (cameraDirector) cameraDirector.SwitchToFollowMode();

            agent.SetDestination(targetInfo.transform.position);
            agent.stoppingDistance = stopDistance;
        }
        else
        {
            Debug.LogError("Location not found: " + locationID);
        }
    }

    void Update()
    {
        if (isMoving && !agent.pathPending)
        {
            float dist = agent.remainingDistance;
            if (dist <= agent.stoppingDistance || dist < 0.5f)
            {
                ArrivedAtDestination();
            }
        }
    }

    private void ArrivedAtDestination()
    {
        if (!isMoving) return;
        isMoving = false;

        if (skyBeam) skyBeam.SetActive(true);
        if (headSpotlight) headSpotlight.enabled = true;
        if (cameraDirector) cameraDirector.SwitchToOverviewMode();
    }
}