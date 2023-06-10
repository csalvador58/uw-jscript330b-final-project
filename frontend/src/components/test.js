function App() {
    const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(true);
    const [displayRequest, setDisplayRequest] = useState(
      'This is a test for request'
    );

    return (
        <div className={classes.container}>
          <div className={classes['item-main1']}>
            <div className={classes['flex-column']}>
              <div>
                {isAdminLoggedIn && (
                  <div className={classes['flex.column']}>
                    <Login
                      isAdminLoggedIn={isAdminLoggedIn}
                      onClickHandler={setDisplayRequest}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className={classes['item-side1']}>
            <h2 className={classes.center}>Request</h2>
            <div>
              <PrintToScreen message={displayRequest} />
            </div>
          </div>
        </div>
      );
    }
    
    export default App;
    