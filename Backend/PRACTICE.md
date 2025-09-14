# Rules for Writing code in this codebase --> 
(have to follow to ensure consistency)

1) I have make asyncHandler, apiError, apiResponse,  
    I). while writing any controller wrap up with async handler
    II). Send response with ApiResponse and send Error message with ApiError

2) for each sub-folder in backend ( controllers,models,routes,middlewares)

    I) Naming convention would be - 
        ex - for controllers --> user.controller.js
            for models  --> user.models.js

3) Don't interpt with the files you aren't working

4) Don't ever push the incomplete/pending code

5) Most important --> Before working always excute command in main directory 

    git pull origin developer
